
from urllib.parse import urlparse, parse_qs
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np 
import os.path
import http.server
import socketserver

PORT =8000

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):

        
        path = urlparse(self.path).path.split("/")[1]#GETS SEARCH OR RECOMMENDATION
        query = parse_qs(urlparse(self.path).query)["content"][0].split()[0].strip()#gets the 
        print(f"path is {path}")
        print(f"query is {query}")
        
        userPath = os.path.abspath("UserDataModel.json")
        recipePath = os.path.abspath("RecipeDataModel.json")
        print(f"userPath is {userPath} and recipePath is {recipePath}")
        
        
        rec = Recommendation(userModelPath=userPath, recipeModelPath=recipePath)
        # Handle GET requests here
        
        
        #content = self.rfile.read(int(self.headers['Content-Length'])).decode('utf-8').strip()
                
        result=None
        if path == 'Recommendation':
            result = rec.findSimilarRecipes(query)
        elif path == 'Search':
            result = rec.search(query)
        else:
            result="Invalid path"
            
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        self.wfile.write(result.encode("utf-8"))
        


class Recommendation:
    def __init__(self,userModelPath: str, recipeModelPath:str) -> None:

        self.recipesAsJSON = pd.read_json(recipeModelPath)
        try:
            self.usersAsJson = pd.read_json(userModelPath, encoding='utf-8')[["favouriteRecipes", "username", "_id"]]
        except ValueError as e:
            print(f"Error reading JSON file: {e}")
        
    def search(self,title):
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        tfidfMatrix = vectorizer.fit_transform(self.recipesAsJSON["title"])

        
        # Step 2: Convert the user's search term into a vector
        queryVector = vectorizer.transform([title])
        # Compare the query term to the TF-IDF matrix
        similarity = cosine_similarity(queryVector, tfidfMatrix).flatten()

        # Get the indices of the most similar titles of the recipes
        indices = np.argpartition(similarity, -5)[-5:]
        
        # Extract both "_id" and "title" for the search results from the original JSON using indices
        results = self.recipesAsJSON.iloc[indices][["_id", "title"]]
        
        return results.to_json(orient="records")  

    def findSimilarRecipes(self,recipeId):
        #check if a recipe is in a user's favourite recipes then take then take their ids 
        #this was only for 1 now we need to find the other recipes they faved
        
        #get all similar users that have the recipeId in their favourite recipes
        
        similarUsers = self.usersAsJson.loc[self.usersAsJson["favouriteRecipes"].apply(lambda row: recipeId in row)]
        #find the users with the recipeid in their favourite recipes from csv
        #and account for this error TypeError: string indices must be integers, not 'str'
        
        
        #get a unqiue list of all other recipes other users favourited
        #1. get the list of all other users that have the same favourite recipe as us then make the list unique with explide and unqiue
        similarUserFavouriteRecipes = self.usersAsJson[self.usersAsJson["_id"].isin(similarUsers["_id"])][["favouriteRecipes"]].explode("favouriteRecipes")

        #get the count of each recipe aka how popular it is among similar users
        recipeAndCount = similarUserFavouriteRecipes.value_counts()
        #turn that to a percent by dividing by the number of total similar users
        precent = recipeAndCount / len(similarUsers)
        #take only the ones that are greater than 30%
        similarUserFavouriteRecipes = precent[precent>0.3]
        
        #find all the users that liked any recipe in our dataset
        #use lambda function where we add the row if any of the recipes in the row are in the similarUserFavouriteRecipes
        #by using a generator expression
        allUsers = self.usersAsJson[self.usersAsJson.apply(lambda row: any(item in similarUserFavouriteRecipes.index for item in row["favouriteRecipes"]), axis=1)][["favouriteRecipes"]]
        #find the percentage of each recipe and how often its favourited by each all the users
        allUsersRecs = allUsers.explode("favouriteRecipes").value_counts()/ len(allUsers)
        
        #now we just compare percentages
        recommendationPercentages = pd.concat([similarUserFavouriteRecipes,allUsersRecs], axis=1) 
        recommendationPercentages.columns=["similar","all"]
        #ratio between similar and all user recommendation scores 
        recommendationPercentages["Scores"]= recommendationPercentages["similar"] / recommendationPercentages["all"]
        recommendationPercentages= recommendationPercentages.sort_values(by="Scores", ascending=False)
        #merge back with the orignal titles to get them
        recommendationPercentages = pd.merge(self.recipesAsJSON[["_id","title"]], recommendationPercentages, left_on="_id", right_on="favouriteRecipes").drop(["Scores","all","similar"], axis=1)
        #return a json object of id:id and title:title
        return recommendationPercentages.to_json(orient="records")   


 

    
if __name__ == "__main__":
    path = "GET /Search?content=Chicken HTTP/1.1"

    
    
    try:
        with socketserver.TCPServer(('localhost', PORT), RequestHandler) as server:
            print(f'Serving at port {PORT}')
            server.serve_forever()
    except Exception as e:
        print(f"Error: {e}")
        


    
    

    
