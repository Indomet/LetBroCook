from urllib.parse import urlparse, parse_qs
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os.path
import http.server
import socketserver
import json
import pymongo
import bson


PORT =8000

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        print("GOT REQUEST")
        
        userPath = os.path.abspath("UserDataModel.json")
        recipePath = os.path.abspath("RecipeDataModel.json")
        print(f"userPath is {userPath} and recipePath is {recipePath}")
        
        rec = Recommendation()
        # parse the request body
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = json.loads(body)
        recipes = data['recipes']
        res = rec.findSimilarRecipes(recipes)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(res.encode("utf-8"))

class Recommendation:
    def __init__(self) -> None:
        self.client = pymongo.MongoClient("mongodb://localhost:27017/")
        self.db = self.client["LetBroCook"]
        self.users_collection = self.db["users"]
        self.recipes_collection = self.db["recipes"]
    def findSimilarRecipes(self, favRecipes):
        users_cursor = self.users_collection.find({}, {"favouriteRecipes": 1, "username": 1, "_id": 1})
        users_df = pd.DataFrame(list(users_cursor))
        
        favRecipes = [bson.ObjectId(recipe) for recipe in favRecipes]
        
        similarUsers = users_df.loc[users_df["favouriteRecipes"].apply(lambda row: any(recipe in row for recipe in favRecipes))]
                
        #find the users with the recipeid in their favourite recipes from csv
        #and account for this error TypeError: string indices must be integers, not 'str'
        #get a unqiue list of all other recipes other users favourited
        #1. get the list of all other users that have the same favourite recipe as us then make the list unique with explide and unqiue
        similarUserFavouriteRecipes = users_df[users_df["_id"].isin(similarUsers["_id"])][["favouriteRecipes"]].explode("favouriteRecipes")
        #get the count of each recipe aka how popular it is among similar users
        recipeAndCount = similarUserFavouriteRecipes.value_counts()
        #turn that to a percent by dividing by the number of total similar users
        precent = recipeAndCount / len(similarUsers)
        #take only the ones that are greater than 30%
        similarUserFavouriteRecipes = precent[precent>0.3]
        
        #find all the users that liked any recipe in our dataset
        #use lambda function where we add the row if any of the recipes in the row are in the similarUserFavouriteRecipes
        #by using a generator expression
        allUsers = users_df[users_df.apply(lambda row: any(item in similarUserFavouriteRecipes.index for item in row["favouriteRecipes"]), axis=1)][["favouriteRecipes"]]
        #find the percentage of each recipe and how often its favourited by each all the users
        allUsersRecs = allUsers.explode("favouriteRecipes").value_counts()/ len(allUsers)
        
        #now we just compare percentages
        recommendationPercentages = pd.concat([similarUserFavouriteRecipes,allUsersRecs], axis=1) 
        recommendationPercentages.columns=["similar","all"]
        #ratio between similar and all user recommendation scores 
        recommendationPercentages["Scores"]= recommendationPercentages["similar"] / recommendationPercentages["all"]
        recommendationPercentages= recommendationPercentages.sort_values(by="Scores", ascending=False)
        #merge back with the orignal titles to get them
        recipes_cursor = self.recipes_collection.find({})
        recipes_df = pd.DataFrame(list(recipes_cursor))
        recommendationPercentages = pd.merge(recipes_df, recommendationPercentages, left_on="_id", right_on="favouriteRecipes").drop(["Scores","all","similar"], axis=1)        
        return recommendationPercentages.to_json(orient="records", force_ascii=False, default_handler=str)


 

    
if __name__ == "__main__":
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["LetBroCook"]
    collection = db["users"]
    for user in collection.find():
        # print(user)
        pass
    try:
        with socketserver.TCPServer(('localhost', PORT), RequestHandler) as server:
            print(f'Serving at port {PORT}')
            server.serve_forever()
    except Exception as e:
        print(f"Error: {e}")
