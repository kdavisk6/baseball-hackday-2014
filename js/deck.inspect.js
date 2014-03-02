$(function(){
	var Card = Backbone.Model.extend({
		defaults: function() {
			return {
				id: 'id',
				firstName: 'fname',
				lastName: 'lname',
				nickName: 'nickname',
				team: 'team',
				position: 'position',
				stats: {
					hitting: {
						avg: '.000',
						rbi: 0,
						walks: 0,
						obp: 0,
						slug: 0,
						overall: 0
					},
					running: {
						steals: {
							caught: 0,
							stolen: 0,
							pct: 0
						},
						overall: 0					
					},
					pitching: {
						era: 0,
						ip: 0,
						so: 0,
						bb: 0,
						overall: 0
					}
				},
				overall: 0
			};
		}
	});

	var PlayerDeckStats = Backbone.Model.extend({
		defaults: function() {
			return {
				pitchers: 0,
				catchers: 0,
				infielders: 0,
				outfielders: 0,
				hitting: 0,
				pitching: 0,
				running: 0,
				overall: 0
			};
		}
	});
	

	var PlayerDeck = Backbone.Collection.extend({
		/* collection of cards */
		model: Card,
		
		/* save the deck to local storage */
		localStorage: new Backbone.LocalStorage('baseball-hackday-personal-decks'),
		
		pitchers: function() {
			return this.where({ position: 'SP' });
		},
		
		catchers: function() {
			return this.where({ position: 'C' });
		},
		
		firstBasemen: function() {
			return this.where({ position: '1B' });
		},
		
		secondBasemen: function() {
			return this.where({ position: '2B' });
		},
		
		thirdBasemen: function() {
			return this.where({ position: '3B' });
		},
		
		shortStops: function() {
			return this.where({ position: 'SS' });
		},
		
		designatedHitters: function() {
			return this.where({ position: 'DH' });
		},
		
		outfielders: function() {
			return this.where({ position: 'OF' });
		},
		
		complete: function() {
			if (this.length === 25) {
				return true;
			}
			return false;
		}
	});
	
	
	var CardView = Backbone.View.extend({
		/* each card will be a list item */
		tagName: 'li',
		
		className: 'card',
		
		/* set our template from the ui */
		template: _.template($('#card-template').html()),

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
		}
	});
	
	var InspectPlayerDeckView = Backbone.View.extend({
		el: $('#fantasytcg-inspect'),
		
		initialize: function() {
			this.deck = new PlayerDeck();
			this.listenTo(this.deck, 'add', this.addCard);
			this.deck.fetch();
		},
		
		/* add a new card */
		addCard: function(card) {
			/* create a new card view and add to the screen */
			var view = new CardView({ model: card });
			
			/* append it */
			this.$('#player-deck').append( view.render().el );	
			
			/* trigger the animation */
			view.render().$el.addClass('switch');
			setTimeout(function() {
				view.render().$el.removeClass('switch');			
			},500);
		}
		
	});
	
	var InspectPlayerDeckApp = new InspectPlayerDeckView();
});