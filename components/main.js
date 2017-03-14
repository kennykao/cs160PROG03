let React         = require('react')
let render        = require('react-dom').render
let request       = require('superagent')
let _             = require('lodash')
let Recipe        = require('./recipe')
let Ingredients   = require('./Ingredients')
let AddRecipe     = require('./AddRecipe')
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

// not exactly pretty, but it'll have to do.
// i'm not even kidding, man.
let Main = React.createClass({
  render : function() {
    console.log(this)
    let createdRows = ""
    if (this.state.items) {
      createdRows = _.map(this.state.items, function(item) {
        return (
          <tr key={item.RecipeName}>
            <td>{item.RecipeName}</td>
            <td><Link to={{ pathname : '/recipe', state : item }}>boop.</Link></td>
            <td><Link to={{ pathname : '/instructions', state : item }}>boop.</Link></td>
          </tr>
        )
      })
    }
    return (
        <div className="wrapper">
          <Link to="/addrecipe">+</Link>
          <table>
            <tbody>
              {createdRows}
            </tbody>
          </table>
        </div>
      )
  },
  getInitialState : function() {
    return {
      items : null
    }
  },
  componentDidMount : function() {
    request
      .get('https://mqov0cihdi.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=Recipes')
      .end(function(err, res) {
        if (res.body) {
          this.setState({ items : res.body.Items })
        }
      }.bind(this))
  }
})

render(
  <Router>
    <div>
      <Route exact path="/" component={Main} />
      <Route path="/recipe" component={Recipe} />
      <Route path="/instructions" component={Ingredients} />
      <Route path="/addrecipe" component={AddRecipe} />
    </div>
  </Router>, document.getElementById('react'))
