$(function(){
	/**
	 * Simple Card Model
	 */
	var Card = Backbone.Model.extend({	
		defaults: function() {
			return {
				name: 'Player Name',
				position: 'Player Position',
				team: 'Player Team'
			};
		}
	});
	
	/**
	 * Card View
	 */
	var CardView = Backbone.View.extend({
		/* each card will be a list item */
		tagName: 'li',
		
		className: 'card',
		
		/* set our template from the ui */
		template: _.template($('#card-template').html()),
		
		/* tag events */
		events: {
			'dblclick .view' : 'details',
			'click a.discard'  : 'discard'		
		},
		
		/* view initialization, watch the change and remove events on the model */
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.hide);
			this.listenTo(this.model, 'remove', this.discard);
		},
		
		/* render function, updates the card display */
		render: function() {
			/* update the element html to match the model json */
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		
		
		/* remove the card */
		discard: function() {
			this.model.destroy();
		},
		
		hide: function() {
			this.$el.addClass('discard');
			setTimeout( $.proxy(function() {
				this.$el.removeClass('discard');
				this.$el.remove();				
			}, this), 500);
		},
		
		/* display the card details in an overlay */
		details: function(e) {
			alert('display details!');
		}
	});


	/**
	 * Collection of Cards or a Deck
	 */
	var Deck = Backbone.Collection.extend({
		/* collection of cards */
		model: Card,
		
		/* save the deck to local storage */
		localStorage: new Backbone.LocalStorage('baseball-hackday-decks'),
		
		/* functions */
		/**
		 * complete: checks to see if the deck is complete
		 */
		complete: function() {
			/* we must have at least 25 cards */
			if (this.length == 25) {
				return true;
			}		
			return false;
		}
	});

	/**
	 * Fantasy TCG Backbone App
	 */
	var FantasyTCG = Backbone.View.extend({

		/* bind to the ui skeleton */
		el: $('#fantasytcg-app'),
		
		/* application events */
		events: {
			'click #generate' : 'generateDeck',
			'click #clear'    : 'discardDeck'
		},
		
		initialize: function() {
			/* create a local copy of the deck */
			this.deck = new Deck();
		
			/* bind to the add events */
			this.listenTo(this.deck, 'add', this.addCard);
			this.listenTo(this.deck, 'addAll', this.addDeck);
			
			/* initialize our collection */
			this.deck.fetch();
		},
		
		/* add a new card */
		addCard: function(card) {
			/* create a new card view and add to the screen */
			var view = new CardView({ model: card });
			
			/* append it */
			this.$('#deck').append( view.render().el );	
			
			/* trigger the animation */
			view.render().$el.addClass('switch');
			setTimeout(function() {
				view.render().$el.removeClass('switch');			
			},500);
		},
		
		/* All all the cards for a deck to the screen at once */
		addDeck: function() {
			this.deck.each(this.addCard, this);
		},
		
		generateDeck: function() {
			/* add a new card to the deck */
			for( var i = 0; i < 25; i ++ ) {
				this.deck.create({ 
					name: 'Kevin Davis' + (i + 1), 
					position: 'pitcher', 
					team: 'Boston Red Sox' 
				});
			}
		},
		
		discardDeck: function() {
			while(this.deck.length !== 0) {
				this.deck.pop();
			}
		}
	});

	/* create a new app */
	var FantasyTCGApp = new FantasyTCG();
});