from urllib.parse import urlparse, parse_qs
import pandas as pd
import http.server
import socketserver
import json
import pymongo
import bson
from bson.objectid import ObjectId
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
PORT =8000

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        recipes = query_params.get('recipe', None)
        rec = Recommendation()
        # parse the request body
        '''content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = json.loads(body)
        recipes = data['recipes']'''
        res = rec.findSimilarRecipes(recipes)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', value='http://localhost:3000')  # Replace with the appropriate origin URL
        self.send_header('Access-Control-Allow-Methods', value='GET')  # Add more methods if needed
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')  # Add more headers if needed
        self.end_headers()
        self.wfile.write(res.encode("utf-8"))

class Recommendation:
    def __init__(self) -> None:
        self.client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")
        self.db = self.client["LetBroCook"]
        self.usersCollection = self.db["users"]
        self.recipesCollections = self.db["recipes"]
        self.commentsCollection = self.db["comments"]
        
    def findSimilarRecipes(self, favRecipes):
        usersCursor = self.usersCollection.find({}, {"favouriteRecipes": 1, "username": 1, "_id": 1})
        usersDF = pd.DataFrame(list(usersCursor))
        try:
            favRecipes = [bson.ObjectId(recipe) for recipe in favRecipes]
            similarUsers = usersDF.loc[usersDF["favouriteRecipes"].apply(lambda row: any(recipe in row for recipe in favRecipes))]
            
            #find the users with the recipeid in their favourite recipes from csv
            #and account for this error TypeError: string indices must be integers, not 'str'
            #get a unqiue list of all other recipes other users favourited
            #1. get the list of all other users that have the same favourite recipe as us then make the list unique with explide and unqiue
            similarUserFavouriteRecipes = usersDF[usersDF["_id"].isin(similarUsers["_id"])][["favouriteRecipes"]].explode("favouriteRecipes")
            #get the count of each recipe aka how popular it is among similar users
            recipeAndCount = similarUserFavouriteRecipes.value_counts()
            #turn that to a percent by dividing by the number of total similar users
            precent = recipeAndCount / len(similarUsers)
            #take only the ones that are greater than 30%
            similarUserFavouriteRecipes = precent[precent>0.3]
            
            #find all the users that liked any recipe in our dataset
            #use lambda function where we add the row if any of the recipes in the row are in the similarUserFavouriteRecipes
            #by using a generator expression
            allUsers = usersDF[usersDF.apply(lambda row: any(item in similarUserFavouriteRecipes.index for item in row["favouriteRecipes"]), axis=1)][["favouriteRecipes"]]
            #find the percentage of each recipe and how often its favourited by each all the users
            allUsersRecs = allUsers.explode("favouriteRecipes").value_counts()/ len(allUsers)
            #now we just compare percentages
            recommendationPercentages = pd.concat([similarUserFavouriteRecipes,allUsersRecs], axis=1) 
            recommendationPercentages.columns=["similar","all"]
            #ratio between similar and all user recommendation scores 
            recommendationPercentages["Scores"]= recommendationPercentages["similar"] / recommendationPercentages["all"]
            recommendationPercentages= recommendationPercentages.sort_values(by="Scores", ascending=False)
            #merge back with the orignal titles to get them
            recipesCursor = self.recipesCollections.find({})
            recipesDF = pd.DataFrame(list(recipesCursor))
            recommendationPercentages = pd.merge(recipesDF, recommendationPercentages, left_on="_id", right_on="favouriteRecipes").drop(["Scores","all","similar"], axis=1)
            for recipeComments in recommendationPercentages["comments"]:
                for i, comment in enumerate(recipeComments):
                    comment_id = ObjectId(comment)
                    try:
                        populatedComment = self.commentsCollection.find_one({"_id": comment_id})
                        owner_id = populatedComment["ownerId"]
                        username = populatedComment["author"]
                        userImage = self.usersCollection.find_one({"_id": owner_id}, {"image": 1})
                        populatedComment["ownerId"] = {"username": username,"_id": owner_id, "image": userImage.get("image")}
                        populatedComment["editing"] = False 
                        recipeComments[i] = populatedComment
                    
                    except Exception as e:
                        print(f"Error: {e}")
                        continue
            return recommendationPercentages.to_json(orient="records", force_ascii=False, default_handler=str)
        except Exception as e :
            print(e)



if __name__ == "__main__":
    try:
            with socketserver.TCPServer(('localhost', PORT), RequestHandler) as server:

                print(f'Serving at port {PORT}')
                server.serve_forever()
    except Exception as e:
            print(f"Error: {e}")
            server.shutdown()