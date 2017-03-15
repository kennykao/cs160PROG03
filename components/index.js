let React         = require('react')
let render        = require('react-dom').render
let request       = require('superagent')
let Main          = require('./Main')
let Recipe        = require('./Recipe')
let Ingredients   = require('./Ingredients')
let AddRecipe     = require('./AddRecipe')

// this is so ugly gg
let Index = React.createClass({
  render : function() {
    let component = null
    switch (this.state.activeComponent) {
      case 'main':
        component = <Main callback={this.callback} items={this.state.items} />
        break
      case 'recipe':
        component = <Recipe callback={this.callback} item={this.state.activeItem} />
        break
      case 'ingredients':
        component = <Ingredients callback={this.callback} item={this.state.activeItem} />
        break
      case 'addRecipe':
        component = <AddRecipe callback={this.callback} />
        break
    }
    return component
  },
  getInitialState : function() {
    return {
      activeComponent: 'main',
      items : null,
      activeItem : null
    }
  },
  componentDidMount : function() {
    this.request()
  },
  request : function() {
    request
      .get('https://mqov0cihdi.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=Recipes')
      .end(function(err, res) {
        if (res.body) {
          this.setState({ items : res.body.Items })
        }
      }.bind(this))
  },
  callback : function(item, active) {
    this.setState({ activeItem : item, activeComponent : active})
    if (active === 'main') {
      this.request()
    }
  }
})

render(<Index />, document.getElementById('react'))
