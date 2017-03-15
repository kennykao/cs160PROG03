let React     = require('react')
let _         = require('lodash')

let Recipe = React.createClass({
  render : function() {
    console.log(this.props)
    let directions = _.split(this.props.item.Directions, '\n')
    let ingredients = _.split(this.props.item.Ingredients, '\n')
    let createdDirections = _.map(directions, function(item) {
      return (<li>{item}</li>)
    })
    let createdIngredients = _.map(ingredients, function(item) {
      return (<li>{item}</li>)
    })
    return (
        <div className="recipe">
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
                <h1>
                  <i className="fa fa-tag" aria-hidden="true" />
                  {this.props.item.RecipeName}
                </h1>
                <img src={this.props.item.Image} />
                <h2>
                  <i className="fa fa-shopping-cart" aria-hidden="true" />
                  Ingredients
                </h2>
                <ul>
                  {createdIngredients}
                </ul>
                <h2>
                  <i className="fa fa-list-ol" aria-hidden="true" />
                  Directions
                </h2>
                <ol>
                  {createdDirections}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )
  },
  goBack : function() {
    this.props.callback(null, 'main')
  }
})

module.exports = Recipe
