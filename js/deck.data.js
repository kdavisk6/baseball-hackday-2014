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
	
	var PlayerDeckStatsView = Backbone.View.extend({
		tagName: 'div',
		
		className: 'player-deck-stats',
		
		/* set our template from the ui */
		template: _.template($('#player-deck-stats-view').html()),
		
		/* render function, updates the card display */
		render: function() {
			/* update the element html to match the model json */
			this.$el.html(this.template(this.model.toJSON()));
			return this;
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

	var BaseDeck = Backbone.Collection.extend({
		/* collection of cards */
		model: Card,
		
		/* url to read the XML from */
		url: 'data/players.xml',
		
		/* override the parse function to parse XML instead of JSON */
		parse: function (data) {
			/* loop through the players */
			var cards = [];
			$(data).find('player').each( function(index){
				/* get the team element */
				var team = $(this).find('team');
				
				/* get the hitting element */
				var hitting = team.find('hitting');
				
				/* get the pitching element */
				var pitching = team.find('pitching');
				
				/* build the hitting object */
				var hittingStats = {};
				var runningStats = {};
				if (typeof hitting !== 'undefined') {
					hittingStats = {
						avg: hitting.attr('avg'),
						rbi: hitting.attr('rbi'),
						walks: hitting.find('onbase').attr('bb'),
						obp: hitting.attr('obp'),
						slug: hitting.attr('slg'),
						overall: 0
					};
					
					runningStats = {
						steals: {
							caught: hitting.find('steal').attr('caught'),
							stolen: hitting.find('steal').attr('stolen'),
							pct: hitting.find('steal').attr('pct')
						}
					};
				}
				
				/* build the pitching stats */
				var pitchingStats = {};
				if (typeof pitchingStats !== 'undefined') {
					pitchingStats = {
						era: pitching.attr('era'),
						ip: pitching.attr('ip_1'),
						so: pitching.find('outcome').attr('ktotal'),
						bb: pitching.find('outcome').attr('ball'),
						overall: 0
					};
					
					runningStats = {
						steals: {
							caught: hitting.find('steal').attr('caught'),
							stolen: hitting.find('steal').attr('stolen'),
							pct: hitting.find('steal').attr('pct')
						}
					};
				}
				/* parse our our player data */
				cards.push({
					id: this.id,
					firstName: $(this).attr('first_name'),
					lastName: $(this).attr('last_name'),
					nickName: $(this).attr('preferred_name'),
					team: team.attr('name'),
					stats: {
						hitting: hittingStats,
						pitching: pitchingStats,
						running: runningStats
					}
				});
			});		
			return cards;
		},
		
		/* override fetch to parse the data from xml */
		fetch: function(options) {
			options = options || {};
			options.dataType = 'xml';
			
			/* fetch the data */
			return Backbone.Collection.prototype.fetch.call(this, options);
		},
		
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
	
	var CardDetailView = Backbone.View.extend({
		tagName: 'div',
		
		className: 'card',
		
		/* set our template from the ui */
		template: _.template($('#card-view').html()),
		
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


	var BaseDeckView = Backbone.View.extend({
		tagName: 'li',
		
		className: 'player',
		
		/* set our template from the ui */
		template: _.template($('#base-deck-view').html()),

		/* render function, updates the card display */
		render: function() {
			/* update the element html to match the model json */
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var FantasyTCG = Backbone.View.extend({
		/* bind to the ui skeleton */
		el: $('#fantasytcg-app'),
		
		events: {
			'click a.player' : 'viewPlayerDetails',
			'click button.add' : 'addToPlayerDeck'
		},
	
		initialize: function() {
			/* set up the deck */
			this.baseDeck = new BaseDeck();
			this.playerDeck = new PlayerDeck();
			
			this.listenTo(this.baseDeck, 'sync', function(items, resp, options) {
				$.ajax({
					url: 'data/rosters.xml',
					dataType: 'xml',
					method: 'get',
					async: 'false',
					success: function(data) {
						$.each(items.models, function(i,v) {
							var position = '';
							$playerProfile = $(data).find('player[id=' + v.id + ']');
							if (typeof $playerProfile.attr('primary_position') !== 'undefined') {						
								position = $playerProfile.attr('primary_position');
							} else {
								position = $playerProfile.attr('position');
							}
							this.set({position: position});
						});					
					}
				});
			});
			
			this.listenTo(this.baseDeck, 'add', function(card) {
				/* create a new card view and add to the screen */
				var view = new BaseDeckView({ model: card });
				
				/* append it */
				this.$('#base-deck').append( view.render().el );	
			});
			
			this.listenTo(this.playerDeck, 'add', function(card) {
				/* build up a new PlayerDeckStats */
				var playerDeckStats = new PlayerDeckStats({
					pitchers : this.playerDeck.pitchers().length,
					infielders : function() {
						return this.playerDeck.firstBasemen().length + this.playerDeck.secondBasemen().length + 
					this.playerDeck.shortStops().length + this.playerDeck.thirdBasemen().length + 
					this.playerDeck.designatedHitters().length;
					}, 
					catchers: this.playerDeck.catchers().length,
					outfielders: this.playerDeck.outfielders().length,
					overall: this.playerDeck.length
				});
				
				/* create a new player deck view */
				var view = new PlayerDeckStatsView({ model: playerDeckStats });
				
				/* append the view */
				this.$('#deck-details').empty();
				this.$('#deck-details').append( view.render().el );
			});
					
			this.baseDeck.fetch();
			this.playerDeck.fetch();
		},
		
		viewPlayerDetails: function(e) {
			/* get the card for the item */
			var id = $(e.currentTarget).attr('data-player-id');
			var player = this.baseDeck.where({ id: id });
			if (typeof player !== 'undefined') {
				var detailView = new CardDetailView({ model: player[0] });
				this.$('#card-details').empty();
				this.$('#card-details').append(detailView.render().el);
			}
		},
		
		addToPlayerDeck: function(e) {
			if ( this.playerDeck.complete() ) {
				$('#error-alert').fadeIn('fast');
				$('button.add').hide();
			} else {
			var id = $(e.currentTarget).attr('data-player-id');
			var player = this.baseDeck.where({ id: id });
			if (typeof player !== 'undefined') {
				/* add this model to the player deck */
				this.playerDeck.create({
					id: player[0].attributes.id,
					firstName: player[0].attributes.firstName,
					lastName: player[0].attributes.lastName,
					nickName: player[0].attributes.nickName,
					team: player[0].attributes.team,
					position: player[0].attributes.position,
					stats: {
						hitting: player[0].attributes.hitting,
						running: player[0].attributes.running,
						pitching: player[0].attributes.pitching
					},
					overall: player[0].attributes.overall
				});
					
					$('#success-alert').fadeIn('fast');
					setTimeout(function() {
						$('#success-alert').fadeOut();
					}, 1500);
					
				}
			}
		}
	});

	var FantasyTCGApp = new FantasyTCG();
});