'use strict'

// --------------------
// Require
// --------------------
const Alexa = require('alexa-app');
const rp = require('request-promise');


// --------------------
// Constants
// --------------------
const DEBUG = true;

const Dynamo = Object.freeze({
    endpoint: 'https://mqov0cihdi.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=Recipes',
    items: 'Items',
});

const Session = Object.freeze({
    state: 'state',
    recipe: 'recipe',
    index: 'index',
});

const State = Object.freeze({
    main: 'MainState',
    recipe: 'RecipeState',
    directions: 'DirectionsState',
    ingredients: 'IngredientsState',
});

const Flow = Object.freeze({
    start: 'FlowStart',
    prev: 'FlowPrev',
    next: 'FlowNext',
    read: 'FlowRead',
});

const Intent = Object.freeze({
    help: 'HelpIntent',
    exit: 'ExitIntent',
    flow: 'FlowIntent',
    restart: 'StartOverIntent',

    select: 'SelectIntent',
    return: 'ReturnIntent',
    ingredients: 'IngredientsIntent',
});

const recipes = [];

const RecipeKey = Object.freeze({
    ingredients: 'ingredients',
    directions: 'directions'
});

/// Reflect values in slotRecipeUnit.txt
const RecipeUnit = Object.freeze({
    ingredients: 'ingredient',
    directions: 'step',
});


// --------------------
// Helpers
// --------------------
function debug(msg)
{
    if (DEBUG)
        console.log(msg);
}

/// Says the given reply msg without ending the session.
Alexa.response.prototype.reply = function(msg)
{
    return this.say(msg).shouldEndSession(false);
}

/// Says the given error msg and ends the session.
Alexa.response.prototype.error = function(msg)
{
    return this.say(msg).shouldEndSession(true);
}


// --------------------
// App
// --------------------
const app = new Alexa.app('recipes');

app.launch((request, response) =>
{
    const session = request.getSession();
    if (!session)
        return response.error("Invalid session.");
    
    // When the skill starts, load all recipes.
    return rp({ uri: Dynamo.endpoint, json: true })
    .catch(error => response.error("Sorry, I could not get the recipes."))
    .then(data =>
    {
        // Convert ingredients and directions from EOL-delimited string to list.
        data[Dynamo.items].forEach(item =>
        {
            const name = item['RecipeName'].toLowerCase();

            recipes[name] = {
                name: name,
                directions: item['Directions'].split('\n'),
                ingredients: item['Ingredients'].split('\n'),
            };
        });

        // Enter main menu
        return mainState(session, response);
    });
});


// --------------------
// States
// --------------------

/// Enter the main state, where the user can choose a recipe.
function mainState(session, response)
{
    session.clear();
    session.set(Session.state, State.main);

    const header = "Recipe assistant, ";
    const prompt = "what recipe would you like to make?";
    return response.reply(header + prompt).reprompt(prompt);
}

/// Enter the recipe state, where the user can choose ingredients or directions.
function recipeState(session, response, recipe)
{
    session.clear();
    session.set(Session.state, State.recipe);
    session.set(Session.recipe, recipe.name);

    const prompt = `Loaded the recipe for ${recipe.name}. Choose ingredients, or exit.`;
    return response.reply(prompt).reprompt(prompt);
}

/**
 * Returns a state function appropriate for the given `RecipeKey`.
 * This helper should not be directly called within an intent or state function,
 * instead call the predefined `ingredientsState` or `directionsState`.
 *
 * @param  key: RecipeKey specifying either ingredients or directions.
 * @return state func(session, response, recipe, flow).
 */
function stateHelper(key)
{
    return (session, response, recipe, flow) =>
    {
        const state = State[key];
        const list = recipe[key];
        const unit = RecipeUnit[key];

        session.set(Session.recipe, recipe.name);
        session.set(Session.state, state);

        if (flow === Flow.start)
        {
            session.set(Session.index, String(-1));

            const text1 = `I will now list the ${key} for ${recipe.name} one by one. `;
            const text2 = `Please choose next ${unit}, last ${unit}, or start again.`;
            return response.reply(text1 + text2).reprompt(text2);
        }

        // Get the stored index and increment only for Flow.next.
        var index = parseInt( session.get(Session.index) );
        if (flow === Flow.next)
            index += 1;

        if (index < 0)
            return response.reply(`I haven't said the first ${unit} yet. Please say next ${unit} to start.`);

        session.set(Session.index, String(index));

        const item = list[index];
        if (index === list.length - 1)
        {
            // Final item.
            var reply = `The final ${unit} is ${item}. `;
            if (key === RecipeKey.ingredients)
            {
                response.reply(reply);
                return directionsState(session, response, recipe, Flow.start);
            }

            reply += "Choose to go back to ingredients or the main menu.";
            return response.reply(reply);
        }

        return response.reply(`${item}`);
    }
}

const ingredientsState = stateHelper(RecipeKey.ingredients);
const directionsState = stateHelper(RecipeKey.directions);


// --------------------
// Intents
// --------------------

/**
 * Scenario: user wants help on what command can be said.
 * Response: all possible commands for the current state.
 */
app.intent(Intent.help,
    {
        utterances: [
            "what {|commands} can I say",
            "help {|me}"
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const commands = (state) => {
            return "";
        };

        const state = session.get(Session.state);
        if (state === State.main)
        {
            return response.reply("The commands for the main menu are find recipe, or exit.");
        }
        else if (state === State.recipe)
        {
            return response.reply("The commands for recipe are list ingredients, or main menu.");
        }
        else if (state === State.ingredients)
        {
            return response.reply("The commands for ingredients list are next ingredient, last ingredient, or start again. To return, say main menu.");
        }
        else if (state === State.directions)
        {
            return response.reply("The commands for directions list are next step, last step, or start again. To return to another menu, say list ingredients or main menu.");
        }
    }
);

/**
 * Scenario: user wants to select a recipe from the main menu.
 * Response: if the recipe exists, move into State.recipe.
 */
app.intent(Intent.select, 
    {
        slots: {"name": "AMAZON.Food"},
        utterances: [
            "{-|name}",
            "{-|name} recipe",
            "recipe for {-|name}",
            "find {|the recipe for} {-|name}",
            "let's make {-|name}",
            "{I'd|I would} like to make {-|name}"
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state !== State.main)
        {
            // Ask to go back to the main menu first if not there.
            const recipe = recipes[ session.get(Session.recipe) ];
            return response.reply(`Presenting ${recipe.name}. Please go back to the main menu before selecting a different recipe.`);
        }

        // Process the recipe request.
        const name = request.slot("name").toLowerCase();
        const recipe = recipes[name];

        if (!recipe)
            return response.reply("I could not find any recipes for " + name);

        // If requested recipe exists, move to the recipe-ingredients state.
        return recipeState(session, response, recipe);
    }
);

/**
 * Scenario: user wants the ingredients to a recipe.
 * Response:
 * - main menu, ingredients -> do nothing.
 * - otherwise              -> go to ingredients.
 */
app.intent(Intent.ingredients,
    {
        utterances: [
            "{list|read} {|the} ingredients",
            "what are the ingredients",
            "{give|tell} me the ingredients"
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state === State.main)
            return response.reply("Please choose a recipe first.");

        
        // All states other than main menu will have an associated recipe.
        const recipe = recipes[ session.get(Session.recipe) ];

        if (state === State.ingredients)
            return response.reply(`Already in the ingredients menu for ${recipe.name}.`);
        
        return ingredientsState(session, response, recipe, Flow.start);
    }
);

/**
 * Scenario: user wants [next|previous|last] [ingredient|step].
 * Response:
 */
app.intent(Intent.flow,
    {
        slots: {
            "flow": "FlowType",
            "unit": "RecipeUnit"
        },
        utterances: [
            "{-|flow}",
            "{-|flow} {-|unit}",
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state === State.main)
            return response.reply("Please choose a recipe first.");

        if (state === State.recipe)
            return response.reply("Please choose to list ingredients first.");

        const flowSlot = request.slot("flow");
        const flow = Flow[ Object.keys(Flow).find(key => flowSlot.includes(key)) ];

        const recipe = recipes[ session.get(Session.recipe) ];
        const unit = request.slot("unit");

        if (state === State.ingredients)
        {
            if (unit === RecipeUnit.directions)
                return response.reply(`I am currently listing the ingredients for ${recipe.name}. Please say ${flowSlot} ${RecipeUnit.ingredients} instead.`);

            return ingredientsState(session, response, recipe, flow);
        }
        else if (state === State.directions)
        {
            if (unit === RecipeUnit.ingredients)
                return response.reply(`I am currently listing the directions for ${recipe.name}. Please say ${flowSlot} ${RecipeUnit.directions} instead.`);

            return directionsState(session, response, recipe, flow);
        }
    }
);

app.intent(Intent.restart,
    {
        utterances: ["start again", "restart"]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state === State.main)
            return response.reply("Please choose a recipe first.");

        if (state === State.recipe)
            return response.reply("Please choose to list ingredients first.");

        // Get the recipe and call matching state.
        const recipe = recipes[ session.get(Session.recipe) ];

        const call = (state === State.ingredients) ? ingredientsState : directionsState;
        return call(session, response, recipe, Flow.start);
    }
);

/**
 * Scenario: when user wants to return to the main menu.
 * Response:
 * - main menu -> do nothing.
 * - otherwise -> return to main menu.
 */
app.intent(Intent.return,
    {
        utterances: [
            "{go back to|return to} {|the} main menu"
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state === State.main)
            return response.reply("Already in main menu.");
        
        return mainState(session, response);
    }
);

/**
 * Scenario: user wants to exit from the current state/context.
 * Response: 
 * - main menu -> quit app/skill.
 * - otherwise -> go back to the main menu.
 */
app.intent(Intent.exit,
    {
        utterances: [
            "{exit|quit|cancel|go back}"
        ]
    },
    (request, response) =>
    {
        const session = request.getSession();
        if (!session)
            return response.error("Invalid session");

        const state = session.get(Session.state);
        if (state === State.main)
            return response.say("Exiting skill.").shouldEndSession(true);   
        
        return mainState(session, response);
    }
);

/// SessionEndRequest.
app.sessionEnded((request, response) =>
{
    const endReply = "Exiting Wendy's Recipes skill. Goodbye!";

    const session = request.getSession();
    if (!session)
        return response.say(endReply).shouldEndSession(true);

    session.clear();
    return response.say(endReply).shouldEndSession(true);    
});

module.exports = app;
