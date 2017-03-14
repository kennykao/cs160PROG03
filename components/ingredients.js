var React     = require('react')

let Ingredients = React.createClass({
  render : function() {
    let item = this.props.location.state
    return (
        <div className="ingredients">
          {item.Ingredients}
        </div>
      )
  }
})

module.exports = Ingredients
