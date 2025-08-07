from flask import Blueprint, request, jsonify, render_template

startseite_blueprint = Blueprint('startseite_blueprint', __name__)

@startseite_blueprint.route("/neue_startseite")
def neue_startseite():
    return render_template("startseite.html")