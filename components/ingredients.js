let React     = require('react')
let _         = require('lodash')

let Ingredients = React.createClass({
  render : function() {
    let ingredients = _.split(this.props.item.Ingredients, '\n')
    let createdIngredients = _.map(ingredients, function(item) {
      return (<li>{item}</li>)
    })
    return (
        <div className="ingredients">
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
                <ul>
                  {createdIngredients}
                </ul>

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

module.exports = Ingredients
