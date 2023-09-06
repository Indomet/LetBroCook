from typing import List, Tuple
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
    url="https://tasty.co/recipe/pumpkin-spice-creme-brulee"
        
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
    
def extractIngredients(url:str):
    htmlSource = requests.get(url).content
    soup = BeautifulSoup(htmlSource,"html5lib")
    
    servingClass = "servings-display xs-text-2 xs-mb2"
    servings=soup.find(class_=servingClass).contents
    
    #it will be a tuple of 3 indices. (servings)
    ingreds : List[Tuple]=[]
    
    sections = soup.find_all(class_="ingredients__section xs-mt1 xs-mb3")

    sectionClass = "ingredient-section-name xs-text-5 extra-bold caps xs-mb1"
    for i,section in enumerate(sections):
        section_name = section.find("p", class_=sectionClass).string.strip() if i!=0 else "Ingredients"
        ingredients = [ingredient.text.strip() for ingredient in section.find_all("li", class_="ingredient xs-mb1 xs-mt0")]

        print(f"Section Name: {section_name}")
        for ingredient in ingredients:
            print(f"- {ingredient}")
        print("-" * 30)

    

    
    

def extractFeatures(soup: BeautifulSoup):
    allLinks = ["tasty.co"+ item.get("href") for item in soup.find_all("a") if item.get("href")]
    allTitles = [title.text.strip() for title in soup.find_all("div",attrs={"class","feed-item__title"})]
    allImages = [img["src"] for img in soup.find_all("img") ] 
    
    return allTitles,allLinks,allImages
if __name__=="__main__":main()
