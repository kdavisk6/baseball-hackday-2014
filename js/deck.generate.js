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

	var FantasyTCG = Backbone.View.extend({
		/* bind to the ui skeleton */
		el: $('#fantasytcg-app'),
		
		events: {
			'click #generate' : 'generateDeck'
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
			
			this.baseDeck.fetch();
			this.playerDeck.fetch();
		},
		
		getRandomInt : function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		
		generateDeck: function(e) {
			this.discardDeck();
			for( i = 0; i < 25; i ++ ) {
				/* get a random index from the base */
				var index = this.getRandomInt(0, this.baseDeck.length);
				
				/* get the instance */
				var player = this.baseDeck.at(index);
				if (typeof player !== 'undefined') {
					this.playerDeck.create({
						id: player.attributes.id,
						firstName: player.attributes.firstName,
						lastName: player.attributes.lastName,
						nickName: player.attributes.nickName,
						team: player.attributes.team,
						position: player.attributes.position,
						stats: {
							hitting: player.attributes.hitting,
							running: player.attributes.running,
							pitching: player.attributes.pitching
						},
						overall: player.attributes.overall
					});
				}
			}
			document.location.href = 'inspect.html';
		},
		
		discardDeck: function() {
			localStorage.clear();
		}
				
	});

	var FantasyTCGApp = new FantasyTCG();
});