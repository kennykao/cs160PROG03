let React         = require('react')
let _             = require('lodash')
let Recipe        = require('./Recipe')
let Ingredients   = require('./Ingredients')
let AddRecipe     = require('./AddRecipe')

// not exactly pretty, but it'll have to do.
// i'm not even kidding, man.
let Main = React.createClass({
  render : function() {
    let createdCells = ""
    if (this.props.items) {
      createdCells = _.map(this.props.items, function(item) {
        return (
          <div className="recipe-display" key={item.RecipeName}>
            <h3>{item.RecipeName}</h3>
            <p>
              <a onClick={this.callback.bind(this, item, 'ingredients')}><i className="fa fa-shopping-cart" aria-hidden="true" /></a>
              <a onClick={this.callback.bind(this, item, 'recipe')}><i className="fa fa-list-ol" aria-hidden="true" /></a>
            </p>
            <img src={item.Image} />
          </div>
        )
      }.bind(this))
    }
    let headerTitle = "it's not like i wanted you to make food or anything, b-baka!"
    let headerSubtitle = "recipe assistance, ingredients lists, and directions for the internet age."
    return (
        <div className="main">
          <div className="screen">
            <div className="header">
              <h1 className="title">{headerTitle}</h1>
              <h3 className="subtitle">{headerSubtitle}</h3>
            </div>
            <a href="#recipetable"><i className="fa fa-angle-down" aria-hidden="true" /></a>
          </div>

          <a name="recipetable" />
          <div className="wrapper">
            <div className="icons">
              <i className="fa fa-search" aria-hidden="true" />
              <i className="fa fa-cog" aria-hidden="true" />
            </div>
            <div className="recipe-table">
              {createdCells}
              <div className="recipe-display">
                <a onClick={this.callback.bind(this, null, 'addRecipe')}>
                  <div className="add-icon">+</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )
  },
  getInitialState : function() {
    return {
      items : null
    }
  },
  callback : function(arg1, arg2) {
    this.props.callback(arg1, arg2)
  }
})

module.exports = Main
