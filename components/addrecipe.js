let React     = require('react')
let request   = require('superagent')

let AddRecipe = React.createClass({
  render : function() {
    return (
        <div className="add-recipe">
          <form onSubmit={this.onSubmit}>
            <p>Name</p>
            <input name="name" />
            <p>Ingredients</p>
            <textarea name="ingredients" />
            <p>Instructions</p>
            <textarea name="directions" />
            <p>Image</p>
            <input name="image" />
            <button type="submit">Submit</button>
          </form>
        </div>
      )
  },
  onSubmit : function(event) {
    event.preventDefault()
    let data = {
      TableName : "Recipes",
      Item : {
        "RecipeName" : event.target.elements.name.value,
        "Ingredients" : event.target.elements.ingredients.value,
        "Directions" : event.target.elements.directions.value,
        "Image" : event.target.elements.image.value
      }
    }
    console.log(data)
    request
      .post('https://mqov0cihdi.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate')
      .send(data)
      .end(function(err, res) {
        if (err || !res.ok) {
         console.log(err)
       } else {
         this.props.history.push('/')
       }
      }.bind(this))
  }
})

module.exports = AddRecipe
