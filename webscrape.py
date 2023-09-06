from typing import Dict, List, Tuple
from bs4 import BeautifulSoup
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver

def getAllRecipes(soup : BeautifulSoup, url):
    
    allATags = soup.find_all("a")#get list of all elemtns with tag a
    alllinks = [url + x.get("href") for x in allATags if x.get("href")]#get all links with attr href
    return {link for link in alllinks if "/recipe/" in link}#get all recipe links
     
    
def showMore(driver: webdriver.Chrome,clicksAmount):
    
    for i in range(clicksAmount):
        try:
            #wait for driver to locate the button
            showMoreBTN = WebDriverWait(driver, 15).until(
                #presence of elemnt returns the button object after its located
                EC.presence_of_element_located((By.CLASS_NAME, "show-more-button"))
            )
            
            #execute JS funciton to click the button
            driver.execute_script("arguments[0].click();", showMoreBTN)
        
        except Exception as e:
            print(f"Error: {e}")
def main():
    url="https://tasty.co/recipe/grilled-corn-summer-pasta-salad"
        
    #driver = webdriver.Chrome()
    #driver.get(url)
    #showMore(driver,0)#click show more button a few times to get more links
    #htmlSource = driver.page_source
    
    htmlSource = requests.get(url).content
    
    #get the inital source
    soup = BeautifulSoup(htmlSource, 'html5lib')  
    #get all the food items as an html string
    x=soup.findAll("li",attrs={"class","feed-item"}).__repr__()
    #create a soup object to be used on all the food items
    soup = BeautifulSoup(x,"html5lib")
    
    x,y,z = extractFeatures(soup)
    #print(f"length of titles is {len(x)}, length of links is {len(y)}, length of images is {len(z)}")
    for title,link,img in zip(x,y,z):
        break#print(f"title is: {title} with link: {link} with img: {img}")
        
    #Now we extract the info from each page
    #The info is: Ingredients, prep steps,header image, tags and possibly other info
    extractIngredients(url)
    
    
def extractServings(url:str):
    htmlSource = requests.get(url).content
    soup = BeautifulSoup(htmlSource,"html5lib")
    
    servingClass = "servings-display xs-text-2 xs-mb2"
    servings=soup.find(class_=servingClass).contents
    
    
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
    def __init__(self, sectionsAndIngredients : Dict[str , List[str]],servings:str) ->None:
        self.sectionsAndIngredients = sectionsAndIngredients
        self.servings = servings
    

    
    

def extractFeatures(soup: BeautifulSoup):
    allLinks = ["tasty.co"+ item.get("href") for item in soup.find_all("a") if item.get("href")]
    allTitles = [title.text.strip() for title in soup.find_all("div",attrs={"class","feed-item__title"})]
    allImages = [img["src"] for img in soup.find_all("img") ] 
    
    return allTitles,allLinks,allImages
if __name__=="__main__":main()
