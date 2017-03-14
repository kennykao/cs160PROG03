var React     = require('react')

let Recipe = React.createClass({
  render : function() {
    let item = this.props.location.state
    return (
        <div className="recipe">
          <p>{item.Directions}</p>
          <p>{item.Image}</p>
          <p>{item.Ingredients}</p>
          <p>{item.RecipeName}</p>
        </div>
      )
  }
})

module.exports = Recipe
