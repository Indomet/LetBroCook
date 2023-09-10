from typing import Dict, List, Callable, Optional
from bs4 import BeautifulSoup
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
import tqdm
import json

     

def main():
    url="https://tasty.co/latest"
        
    '''driver = webdriver.Chrome()
    driver.get(url)
    showMore(driver,10)#click show more button a few times to get more links
    htmlSource = driver.page_source'''
    
    htmlSource = requests.get(url).content
    
    #get the inital source
    soup = BeautifulSoup(htmlSource, 'html5lib')  
    #get all the food items as an html string
    x=soup.findAll("li",attrs={"class","feed-item"}).__repr__()
    #create a soup object to be used on all the food items
    soup = BeautifulSoup(x,"html5lib")
    
    titles,links,images = extractFeatures(soup)
        
    #Now we extract the info from each page
    recipes= []
    for i in tqdm.trange(len([22,2])):
        link=links[i]
        recipe=createRecipe(link)
        recipes.append(recipe)
        
    with open("RecipeData.json", "w",encoding="utf-8") as outfile:
        # Create a dictionary with a key for the list of recipes
        recipeDicts = [recipe.to_dict() for recipe in recipes]
        #data = {"recipes": recipeDicts}perhaps this is needed to get the val not sure yet 
        json.dump(recipeDicts, outfile, indent=4, ensure_ascii=False)

def scrapeContent(url: str, htmlClass: str, isSingleElement: bool,
        conditionFunction: Optional[Callable[[BeautifulSoup], bool]] = lambda _: True,
        htmlTag=None,):
    
    html_source = requests.get(url).content
    soup = BeautifulSoup(html_source, "html5lib")
    
    elements = soup.find_all(htmlTag,class_=htmlClass)
    
    if isSingleElement:
        return elements[0].getText() if elements else ""
    else:
        return [element.get_text() for element in elements if conditionFunction(element)]

    
def extractServings(url:str):
    htmlClass = "servings-display xs-text-2 xs-mb2"
    return scrapeContent(url,htmlClass,True)
    
def extractDescription(url:str):
    htmlClass="description xs-text-4 md-text-3 lg-text-2 xs-mb2 lg-mb2 lg-pb05"
    return scrapeContent(url,htmlClass,True)

def extractTags(url:str):
    tagsClass = "breadcrumb_item xs-mr1"
    return scrapeContent(url=url,htmlClass=tagsClass,htmlTag="a",isSingleElement=False)
    

def extractNutritionalInfo(url:str):
    infoClass = "list-unstyled xs-mb1"
    htmlTag = "li"
    return scrapeContent(url=url,htmlClass=infoClass,isSingleElement=False,htmlTag=htmlTag)


def extractSteps(url:str):
    prepClass = "xs-mb2"
    htmlTag= "li"
    excludeLinks = lambda element: not element.find("a") 
    return scrapeContent(url,prepClass,False,excludeLinks,htmlTag)

def extractIngredients(url:str):
    """The method takes in a url from the website Tasty.co and returns 
        a dict with the section and its ingredients in a dict with the number of
        servings the recipe creates
    Args:
        url (str): the url to the recipe on the website
    """
    htmlSource = requests.get(url).content
    soup = BeautifulSoup(htmlSource,"html5lib")

    #create a dict where key is the section and the value is a list of ingredients
    ingredsWithSection : Dict[str,List[str]] = {}
    #get all the sections html element with all its nested sub sections and ingredients
    sections = soup.find_all(class_="ingredients__section xs-mt1 xs-mb3")

    #define a class to be used to find the section
    sectionClass = "ingredient-section-name xs-text-5 extra-bold caps xs-mb1"
    for i,section in enumerate(sections):
        #find a section and strip to get the tag content. the if statement is to get the ingredioents section
        #as its always the first index of these sections
        sectionName = section.find("p", class_=sectionClass).string.strip() if i!=0 else "Ingredients"
        #get all the ingredeints of a given section and strip them one by one
        ingredients = [ingredient.text.strip() for ingredient in section.find_all("li", class_="ingredient xs-mb1 xs-mt0")]
        #add the section and its ingredinets to the dict
        ingredsWithSection[sectionName] = ingredients
        
    return ingredsWithSection
    
class Recipe():
    def __init__(self,
                 sectionsAndIngredients: Dict[str, List[str]],
                 servings: str,
                 description: str,
                 steps: List[str],
                 tags: List[str],
                 nutritionalInfo: List[str]) -> None:
        self.sectionsAndIngredients = sectionsAndIngredients
        self.servings = servings
        self.description = description
        self.steps = steps
        self.tags = tags
        self.nutritionalInfo = nutritionalInfo
        
    def to_dict(self):
        return self.__dict__

def createRecipe(url:str) -> Recipe:
    sectionsAndIngredients = extractIngredients(url)    
    servings = extractServings(url)
    description = extractDescription(url)
    steps = extractSteps(url)
    tags = extractTags(url)
    nutritionalInfo = extractNutritionalInfo(url)
    return Recipe(sectionsAndIngredients,servings,description,
                  steps,tags,nutritionalInfo)
    

def extractFeatures(soup: BeautifulSoup):
    allLinks = ["https://tasty.co"+ item.get("href") for item in soup.find_all("a") if item.get("href")]
    allTitles = [title.text.strip() for title in soup.find_all("div",attrs={"class","feed-item__title"})]
    allImages = [img["src"] for img in soup.find_all("img") ] 
    return allTitles,allLinks,allImages

def showMore(driver: webdriver.Chrome,clicksAmount):
    
    for _ in range(clicksAmount):
        try:
            #wait for driver to locate the button
            showMoreBTN = WebDriverWait(driver, 15).until(
                #presence of elemnt returns the button object after its located
                EC.presence_of_element_located((By.CLASS_NAME, "show-more-button")))
            
            #execute JS funciton to click the button
            driver.execute_script("arguments[0].click();", showMoreBTN)
        
        except Exception as e:
            print(f"Error: {e}")

if __name__=="__main__":main()
