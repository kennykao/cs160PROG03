let React     = require('react')
let request   = require('superagent')
let $         = require('jquery')

let AddRecipe = React.createClass({
  render : function() {
    return (
        <div className="addrecipe">
          <div className="screen">
            <a onClick={this.goBack}>
              <i className="fa fa-arrow-left" aria-hidden="true"/>
            </a>
            <a onClick={this.goBack}>
              <i className="fa fa-home" aria-hidden="true"/>
            </a>
            <i className="fa fa-search" aria-hidden="true" />
          </div>

          <div className="wrapper">
            <div className="container">
              <div className="nested">
                <form onSubmit={this.onSubmit}>
                  <div className="form-row">
                    <label>Recipe Name</label>
                    <input name="name" />
                  </div>
                  <div className="form-row">
                    <label>Ingredients</label>
                    <textarea name="ingredients" />
                  </div>
                  <div className="form-row">
                    <label>Directions</label>
                    <textarea name="directions" />
                  </div>
                  <div className="form-row">
                    <label>Image</label>
                    <input type="file" name="image" accept="image/*" />
                  </div>
                  <button type="submit">Add Recipe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
  },
  goBack : function() {
    this.props.callback(null, 'main')
  },
  onSubmit : function(event) {
    event.preventDefault()
    let data = {
      TableName : "Recipes",
      Item : {
        "RecipeName" : event.target.elements.name.value || "",
        "Ingredients" : event.target.elements.ingredients.value || "",
        "Directions" : event.target.elements.directions.value || ""
      }
    }
    data = JSON.stringify(data)
    request
      .post('https://mqov0cihdi.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate')
      .send(data)
      .end(function(err, res) {
        if (err || !res.ok) {
         console.log(err)
       } else {
         this.props.callback(null, 'main')
       }
      }.bind(this))
  }
})

module.exports = AddRecipe
