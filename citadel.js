/*!
* Crackle - Global JavaScript Library - Code Name: Citadel
* Version: 1.2.1
* Author: Allen Sarkisyan, Maryna Chysiuk
* Naming Conventions: (API Layer: PascalCased / App Layer - camelCased)
* Copyright: 2012 Crackle, Inc. - Sony Pictures Television, Inc.
*
* TODO LIST:
* email, user_birthday, publish_actions, user_likes, friends_likes, user_actions.video, friends_actions.video, friends_actions:crackleapp  - add to permissions needed
*/
Date.prototype.ISO8601 = function () {
    function wrap(n) { return (n < 10 ? '0' + n : n); }
    var dt = this;
    return dt.getUTCFullYear() + '-' + wrap(dt.getUTCMonth() + 1) + '-' + wrap(dt.getUTCDate()) + 'T' + wrap(dt.getUTCHours()) + ':' + wrap(dt.getUTCMinutes());
};

if (typeof (Crackle) == 'undefined') var Crackle = {};
Crackle.version = '1.2.2';

// Crackle API Config Properties
Crackle.Config = {
    ApiUrl: 'https://ps3-api-us.crackle.com/Service.svc',
    Region: 'us',
    Locale: 'en-us',
    getConfig: function(callback){
        Crackle.API.Request({
                url: "https://api.crackle.com/Service.svc/appconfig?format=json",
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
    }
};

// Core Crackle API Object
Crackle.API = {
    Request: function (obj, auth) {
        if (!obj || !obj.url) { return false; }
        if (!obj.type) {
            obj.type = 'GET';
        }

        var callback = (obj.asyncCallback && obj.asyncCallback.async !== false);
        var xhr = new XMLHttpRequest();
        xhr.open(obj.type, obj.url, callback);
        xhr.setRequestHeader('Content-Type', 'application/json');

        if (Authentication) {
            var token = Authentication.GenerateToken(obj.url);
            if (!token) { return false; }
            console.log("TOKEN: " + token)
            xhr.setRequestHeader('Authorization', token);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var success = (xhr.status === 200 || xhr.status === 304);
                if (success) {
                    try {
                        var json = JSON.parse(xhr.responseText);
                        if (obj.cb) {
                            obj.cb(json);
                        }
                    } catch (error) {
                        throw new Error('Crackle API JSON Parse failed: ' + obj.url);
                    }
                } else {
                    if (obj.cb) {
                        obj.cb(xhr);
                    }
                    throw new Error('Crackle API Request failed: ' + obj.url);
                }
            }
        };
        xhr.send(null);
    },
    Content: {
        RegionFormat: function () {
            return ('/' + Crackle.Config.Region + '?format=json');
        },
        GetMedia: function (type, cat, filter, numItems, callback) {
            // type : featured, recent, popular
            // cat : all, movies, moviesandtv, television, originals, shows, collections
            // filter : all, full, trailers, clips, minisodes
            if (!type || !cat || !filter || !numItems) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/' + type + '/' + cat + '/' + filter + '/' + Crackle.Config.Region + '/' + numItems + '?format=json';

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        GetSlideShow: function (channel, callback) {
            // channel : home, movies, shows
            if (!channel) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/slideshow/' + channel + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });

            return obj;
        },
        GetChannelDetails: function (channelId, callback) {
            if (!channelId) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/details/channel/' + channelId + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        GetMediaDetails: function (mediaId, callback) {
            if (!mediaId) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/details/media/' + mediaId + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        GetChannelFolderWatchlist: function (channelId, callback) {
            if (!channelId) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/channel/' + channelId + '/folders' + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        GetSearchResults: function (itemType, keyword, callback) {
            if (!itemType || !keyword) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/search/' + itemType + '/' + keyword + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        Browse: function (channelType, filter, genreType, sortOrder, callback) {
            // channelType: all, movies, moviesandtv, television, collections, originals, shows
            // filter: all, full, trailers, clips, minisodes
            // genreType: use the object from Crackle.API.GenreList
            // sortOrder: date, date-asc, date-desc, alpha, alpha-asc, alpha-desc
            if (!channelType || !filter || !genreType || !sortOrder) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/browse/' + channelType + '/' + filter + '/' + genreType + '/' + sortOrder + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        BrowseFilters: function (channelType, callback) {
            // channelType : movies, collections, television, originals, shows
            if (!channelType) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/browse/' + channelType + '/filters?format=json';

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        },
        GenreList: function (cat, genreType, callback) {
            // cat: all, movies, television, originals, shows, collections
            // genreType: all, primary, secondary
            if (!cat || !genreType) { return false; }
            var obj = null, url = Crackle.Config.ApiUrl + '/genres/' + cat + '/' + genreType + this.RegionFormat();

            Crackle.API.Request({
                url: url,
                cb: function (data) {
                    obj = data;
                    if (callback) { return callback.cb(obj); }
                },
                asyncCallback: (callback ? callback : false)
            });
            return obj;
        }
    }
};

// Crackle Social Objects
Crackle.social = {
    facebook: {
        isInitialized: false,
        isLoggedIn: false,
        isConnected: false,
        isImplicit: true,
        allowPublish: false,
        socialShare: false,
        socialReminder: true,
        fbid: '',
        watchActionId: '',
        accessToken: '',
        avatarUrl: '',
        showNUXDialog: null,
        permalink: function () {
            return $jq('#permalinkHidden').val();
        },
        ogType: function () {
            return $jq('#ogTypeHidden').val();
        },
        ogVideoSeries: function () {
            return $jq('#ogVideoSeriesHidden').val();
        },
        isAuthorized: function () {
            return (!this.isInitialized || !this.isConnected) ? false : true;
        },
        isSocialOn: function () {
            return (!this.isAuthorized() || !this.isLoggedIn || !this.allowPublish || !this.socialShare || !this.accessToken) ? false : true;
        },
        isReminderOn: function () {
            return (!this.isSocialOn() || !this.socialReminder) ? false : true;
        },
        init: function (callback) {
            this.isInitialized = true;

            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    Crackle.social.facebook.isConnected = true;
                    Crackle.social.facebook.accessToken = response.authResponse.accessToken;
                    Crackle.social.facebook.fbid = response.authResponse.userID;

                    if (!_user) {
                        Crackle.social.facebook.handleLogin(response.authResponse.accessToken);
                    } else {
                        Crackle.social.facebook.isLoggedIn = true;
                        _user.DisplayUser();
                        Crackle.social.facebook.loadUser(true);
                    }

                    if (Crackle.social.facebook.showNUXDialog && readCookie('newToCrackle') === 'false') {
                        Crackle.social.facebook.handleNewUser();
                    }
                    if ($jq('#activities_link').length > 0) {
                        $jq('#activities_link').show();
                    }
                } else if (_user && response.status === 'unknown' && !Crackle.social.facebook.fbid && readCookie('fbUser')) {
                    // The user has logged out and has had a previous session.
                    Crackle.social.facebook.handleLogout();
                } else {
                    Crackle.social.facebook.socialOff();
                    $jq('#socialOff .login-facebook').css({ 'display': 'block' });
                }
            });

            FB.Event.subscribe('auth.authResponseChange', function (response) {
                if (response.status === 'not_authorized') {
                    if (_user !== null) {
                        Crackle.social.facebook.handleLogout();
                    }
                }
            });

            FB.Event.subscribe('auth.logout', function (response) {
                if (_user !== null) {
                    Crackle.social.facebook.handleLogout();
                }
            });

            // Update the comment count OR can also trigger omniture tracking if needed.
            FB.Event.subscribe('comment.create', function (response) {
                if (!response) { return false; }
                FB.XFBML.parse($jq('#actionComment')[0]);
            });

            FB.Event.subscribe('comment.remove', function (response) {
                if (!response) { return false; }
                FB.XFBML.parse($jq('#actionComment')[0]);
            });

            if (callback) { callback(); }
            return 'Successfully initialized.';
        },
        getPermissions: function (cb) {
            if (!this.isAuthorized()) { return false; }
            FB.api('/me/permissions', function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    var data = response.data[0];
                    Crackle.social.facebook.allowPublish = (data.publish_actions && data.publish_actions.toString() === '1');
                    if (cb) { return cb(data); }
                }
            });
            return true;
        },
        promptPublishActions: function (cb) {
            FB.login(function (response) {
                if (response.authResponse) {
                    console.log(response);
                    var accessToken = response.authResponse.accessToken;
                    if (accessToken) {
                        Crackle.social.facebook.accessToken = accessToken;
                        Crackle.social.facebook.getPermissions(function (data) {
                            Crackle.social.facebook.allowPublish = (data.publish_actions && data.publish_actions.toString() === '1');
                            if (cb && Crackle.social.facebook.allowPublish) {
                                setTimeout(function () {
                                    $jq('#socialToggle').trigger('displayPublicAwareness');
                                }, 250);
                                return cb();
                            }
                        });
                    }
                }
            }, { scope: 'publish_actions, user_actions.video' });
        },
        login: function (cb) {
            if (!this.isInitialized) { return false; }
            OmnTrackCustomLink('Login Facebook');
            Crackle.dialogs.login.close();
            FB.login(function (response) {
                if (response.authResponse) {
                    Crackle.social.facebook.isConnected = true;
                    Crackle.social.facebook.fbid = response.authResponse.userID;
                    var accessToken = response.authResponse.accessToken;
                    if (accessToken) {
                        Crackle.social.facebook.accessToken = accessToken;
                        Crackle.social.facebook.getPermissions();
                        if (cb) { cb(); }
                        $jq('body').addClass('loggedIn').trigger('login');
                        Crackle.social.facebook.handleLogin(accessToken);
                        $jq('#socialMenu .login-facebook').hide();
                        $jq('#socialToggle').trigger('displayPublicAwareness');
                    }
                }
            }, { scope: 'email, user_birthday, publish_actions, user_actions.video' });
            return true;
        },
        logout: function () {
            if (!this.isAuthorized() || !this.isLoggedIn) {
                this.handleLogout();
                return false;
            }
            $jq('#socialMenu').hide();
            $jq('body').removeClass('loggedIn').trigger('logout');
            FB.logout(function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    Crackle.social.facebook.isLoggedIn = false;
                }
            });
            return true;
        },
        handleLogin: function (accessToken, cb) {
            if (!accessToken) { return false; }
            var strURL = '/accounts/fbsso.ashx?at=' + accessToken;
            $jq.ajax({
                url: strURL,
                type: 'POST',
                dataType: 'json',
                success: function (response) {
                    Crackle.social.facebook.isLoggedIn = true;
                    Crackle.social.facebook.loadUser(true);
                    Crackle.social.facebook.handleSocial();
                    // Need to resolve the need of this function in future release
                    Crackle.user.loadUser(response);
                    if (cb) { return cb(); }
                },
                error: function (jqXHR, status, error) { console.log(status); }
            });
        },
        handleLogout: function () {
            $jq('#socialMenu').hide();
            $jq('body').removeClass('loggedIn').trigger('logout');
            deleteCookie('fbUser', '/', readCookie('fbUser'));
            $jq.ajax({
                type: 'POST',
                url: '/accounts/signout.ashx',
                async: false,
                success: function () {
                    _user = null;
                    if (location.pathname.toLowerCase().indexOf('members') != -1) {
                        location.href = 'http://' + location.host;
                    }
                },
                error: function (error) { console.log('Something went wrong.'); }
            });
        },
        handleSocial: function () {
            $jq.ajax({
                url: '/members/setsocial.ashx?getStatus=true',
                type: 'GET',
                async: false,
                dataType: 'json',
                success: function (response) {
                    if (!response) {
                        Crackle.social.facebook.socialOff();
                        Crackle.social.facebook.socialReminder = false;
                        return false;
                    }

                    if (!response.social) {
                        Crackle.social.facebook.socialOff();
                    } else {
                        Crackle.social.facebook.socialOn();
                    }

                    if (!response.reminder) {
                        Crackle.social.facebook.socialReminder = false;
                        $jq('#socialReminder').removeClass('socialReminderOn');
                    } else {
                        Crackle.social.facebook.socialReminder = true;
                        $jq('#socialReminder').addClass('socialReminderOn');
                    }

                    if (!response.socialMessage && readCookie('newToCrackle') === 'false') {
                        Crackle.social.facebook.handleNewUser();
                    }
                },
                error: function (error) { console.log('Something went wrong.'); }
            });
        },
        handleNewUser: function () {
            $jq.ajax({
                type: 'GET',
                url: '/members/setsocial.ashx?getStatus=true',
                success: function (response) {
                    if (!response) { return false; }
                    if (!response.socialMessage) {
                        Crackle.stats.omniture.trRegistrationCompleted();
                        var nux = $jq('#newUserExperience');
                        nux.dialog({
                            width: '800px',
                            modal: true,
                            closeText: _closeText,
                            autoResize: false,
                            position: ['center', 125],
                            open: function () {
                                try {
                                    if (typeof PauseVideo !== 'undefined') { PauseVideo(); }
                                } catch (error) { }
                                $jq('#newUserExperience .btnOrange, #newUserExperience .btnGray').bind('click', function (evt) {
                                    evt.preventDefault();
                                    var target = $jq(evt.target);
                                    Crackle.social.facebook.toggleSocial(target.hasClass('btnOrange'));
                                    nux.dialog('close');
                                });
                            },
                            close: function () {
                                Crackle.social.facebook.toggleSocial(true);
                                $jq.ajax({
                                    type: 'POST',
                                    url: '/members/setsocial.ashx?m=true',
                                    success: function (data) {
                                        console.log(data.socialMessage);
                                    },
                                    error: function (error) {
                                        console.log('Something went wrong.');
                                    }
                                });
                                try {
                                    if (typeof PlayVideo !== 'undefined') { PlayVideo(); }
                                } catch (error) { }
                                $jq('#newUserExperience .btnOrange, #newUserExperience .btnGray').unbind('click');
                            }
                        });
                    }
                },
                error: function (error) { console.log('Something went wrong.'); }
            });
        },
        handleSocialToggle: function () {
            var toggleState = $jq('#socialToggle').hasClass('socialOn');
            $jq.ajax({
                url: '/members/setsocial.ashx?s=' + !toggleState,
                type: 'POST',
                success: function (response) {
                    if (toggleState && !response.social) {
                        Crackle.social.facebook.socialOff();
                    } else {
                        Crackle.social.facebook.socialOn();
                    }
                    if (!response.reminder) {
                        Crackle.social.facebook.socialReminder = false;
                        $jq('#socialReminder').removeClass('socialReminderOn');
                    } else {
                        Crackle.social.facebook.socialReminder = true;
                        $jq('#socialReminder').addClass('socialReminderOn');
                    }
                },
                error: function (error) { console.log('Something went wrong.'); }
            });
        },
        socialOn: function () {
            this.socialShare = true;
            $jq('#socialStatus').html(Crackle.str.socialOn);
            var toggle = $jq('#socialToggle');
            toggle.addClass('socialOn');
            $jq('#socialMenu').removeClass('socialOff').addClass('socialOn');
            $jq('#publicAwareness').removeClass('socialOff').addClass('socialOn');
            toggle.trigger('displayPublicAwareness');
        },
        socialOff: function () {
            this.socialShare = false;
            $jq('#socialStatus').html(Crackle.str.socialOff);
            var toggle = $jq('#socialToggle');
            toggle.removeClass('socialOn');
            $jq('#socialMenu').removeClass('socialOn').addClass('socialOff');
            $jq('#publicAwareness').removeClass('socialOn').addClass('socialOff');
            toggle.trigger('displayPublicAwareness');

        },
        toggleSocial: function (override) {
            if (!this.isInitialized) { return false; }
            if (!this.isAuthorized() || !this.isLoggedIn) {
                return this.login();
            }
            if (!this.allowPublish) {
                return this.promptPublishActions(this.handleSocialToggle);
            }
            if (override) { return $jq('#socialToggle').trigger('displayPublicAwareness'); }

            return this.handleSocialToggle();
        },
        toggleReminder: function () {
            var chkBox = $jq('#socialReminder'), chkBoxState = chkBox.hasClass('socialReminderOn');
            $jq.ajax({
                url: '/members/setsocial.ashx?r=' + !chkBoxState,
                type: 'POST',
                success: function () {
                    if (chkBoxState) {
                        chkBox.removeClass('socialReminderOn');
                        Crackle.social.facebook.socialReminder = false;
                    } else {
                        chkBox.addClass('socialReminderOn');
                        Crackle.social.facebook.socialReminder = true;
                    }
                },
                error: function (error) { console.log('Something went wrong.'); }
            });
        },
        parseXFBML: function (obj) {
            FB.XFBML.parse(obj);
        },
        loadComments: function () {
            var self = (this === window ? Crackle.social.facebook : this);
            return setTimeout(function () {
                var url = self.permalink();
                if (!self.isInitialized || !url) { return false; }
                var commentsContainer = $jq('#content-comments');
                var width = commentsContainer.css('width');
                $jq('#facebookComments').html('<div class="fb-comments" data-href="' + url + '" data-num-posts="5" data-width="' + width + '"></div>');
                $jq('#actionCommentCount').html('<fb:comments-count href="' + url + '"></fb:comments-count>');
                commentsContainer.show();
                Crackle.social.facebook.parseXFBML(commentsContainer[0]);
                Crackle.social.facebook.parseXFBML($jq('#actionComment')[0]);
                return true;
            }, 250);
        },
        loadTooltipLikes: function () {
            if (!Crackle.social.facebook.isInitialized) { return false; }
            var tooltip = $jq('.tooltipFacebookLike')[0];
            if (tooltip) {
                Crackle.social.facebook.parseXFBML(tooltip);
                return true;
            }
            return false;
        },
        // Probably not needed anymore leave in just incase
        loadAvatar: function () {
            if (!this.isAuthorized()) { return false; }
            FB.api('/me/picture?type=square', function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    Crackle.social.facebook.avatarUrl = response.data.url;
                    if (!$jq('#facebookAvatar').attr('src').match('graph.facebook')) {
                        $jq('#memberAvatar').html('<a href="/members/editProfile.aspx"><img src="' + response.data.url + '" /></a>');
                    }
                }
            });
            return true;
        },
        loadUser: function (fql, cb) {
            if (!this.isAuthorized()) { return false; }
            $jq('#socialMenu .login-facebook').hide();

            if (!fql) {
                FB.api('/me', function (response) {
                    if (cb) { cb(response); }
                });
                return true;
            } else {
                if (!this.fbid) { return false; }
                var obj = {
                    q: {
                        userInfo: 'SELECT first_name, pic_square FROM user WHERE uid = ' + this.fbid,
                        permissions: 'SELECT publish_actions FROM permissions WHERE uid = ' + this.fbid
                    }
                };
                FB.api('/fql', obj, function (response) {
                    if (!response || response.error) {
                        console.log(response.error);
                    } else {
                        var data = response.data;
                        for (var i in data) {
                            if (data.hasOwnProperty(i)) {
                                if (data[i].name === 'permissions') {
                                    Crackle.social.facebook.allowPublish = (data[i].fql_result_set[0].publish_actions.toString() === '1');
                                }
                                if (data[i].name === 'userInfo') {
                                    Crackle.social.facebook.avatarUrl = data[i].fql_result_set[0].pic_square;
                                    if (!$jq('#facebookAvatar').attr('src').match('graph.facebook')) {
                                        $jq('#memberAvatar').html('<img id="facebookAvatar" src="' + data[i].fql_result_set[0].pic_square + '" alt="' + data[i].fql_result_set[0].first_name + '" />');
                                    }
                                }
                            }
                        }
                    }
                });
            }
            return true;
        },
        postWatch: function (duration) {
            // Feedback from FB - Check the list of watches first, prevent the API call if there has been a watch action against the object URL
            if (!this.isSocialOn()) { return false; }
            var url = this.permalink(), videoSeries = this.ogVideoSeries();
            if (!url) { return false; }

            var obj = {
                created_time: (new Date()).ISO8601(),
                expires_in: (duration ? duration : 10)
            };

            switch (this.ogType()) {
                case 'video.movie':
                    obj.movie = url;
                    break;
                case 'video.episode':
                    if (!videoSeries) { return false; }
                    obj.episode = url;
                    obj.series = videoSeries;
                    break;
                case 'video.tv_show':
                    obj.tv_show = url;
                    break;
                case 'video.other':
                    obj.video = url;
                    break;
                default:
                    return false;
            }

            FB.api('/me/video.watches?access_token=' + this.accessToken, 'POST', obj, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Watch ID: ' + response.id);
                    Crackle.social.facebook.watchActionId = response.id;
                }
            });
            return true;
        },
        updateWatch: function (duration) {
            if (!this.watchActionId || !duration) { return false; }
            FB.api(this.watchActionId, 'POST', { expires_in: duration }, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Success: ' + response);
                }
            });
            return true;
        },
        removeWatch: function () {
            if (!this.watchActionId) { return false; }
            FB.api(this.watchActionId, 'DELETE', function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    Crackle.social.facebook.watchActionId = '';
                    console.log('Success: ' + response);
                }
            });
            return true;
        },
        deleteWatches: function () {
            FB.api('me/video.watches', function (response) {
                for (var i in response.data) {
                    if (response.data.hasOwnProperty(i)) {
                        FB.api('/' + response.data[key].id + '?access_token=' + Crackle.social.facebook.accessToken, 'DELETE');
                    }
                }
            });
        },
        // probably don't need anymore, leave in just incase we have our own like button and want to use it instead
        postLike: function () {
            var url = this.permalink();
            if (!this.isInitialized || !url) { return false; }
            FB.api('/me/og.likes?access_token=' + this.accessToken, 'POST', { object: url }, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Like ID: ' + response.id);
                }
            });
            return true;
        },
        // probably don't need anymore, leave in just incase
        postComment: function (msg) {
            var url = this.permalink(), videoSeries = this.ogVideoSeries();
            if (!this.isInitialized || !url) { return false; }

            var obj = {
                message: (msg ? msg : '')
            };

            switch (this.ogType()) {
                case 'video.movie':
                    obj.movie = url;
                    break;
                case 'video.episode':
                    if (!videoSeries) { return false; }
                    obj.episode = url;
                    obj.series = videoSeries;
                    break;
                case 'video.tv_show':
                    obj.tv_show = url;
                    break;
                case 'video.other':
                    obj.video = url;
                    break;
                default:
                    return false;
            }

            FB.api('/me/crackleapp:comment?access_token=' + this.accessToken, 'POST', obj, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Comment ID: ' + response.id);
                }
            });
            return true;
        },
        postShare: function (graph, msg) {
            var url = this.permalink(), videoSeries = this.ogVideoSeries();
            if (!graph) {
                obj = {
                    method: 'feed',
                    link: url,
                    picture: $jq('meta[property="og:image"]').attr('content'),
                    name: $jq('meta[property="og:title"]').attr('content'),
                    caption: 'Watch now on Crackle!', // TODO: Need to localize.
                    description: $jq('meta[property="og:description"]').attr('content')
                };
                FB.ui(obj, function (response) {
                    if (!response) {
                        console.log('Nothing was shared.');
                    } else {
                        console.log('Share ID: ' + response.id);
                    }
                });
                return true;
            }

            var obj = {
                message: (msg ? msg : '')
            };

            switch (this.ogType()) {
                case 'video.movie':
                    obj.movie = url;
                    break;
                case 'video.episode':
                    if (!videoSeries) { return false; }
                    obj.episode = url;
                    obj.series = videoSeries;
                    break;
                case 'video.tv_show':
                    obj.tv_show = url;
                    break;
                case 'video.other':
                    obj.video = url;
                    break;
                default:
                    return false;
            }

            // Custom Open Graph version
            FB.api('/me/crackleapp:share?accessToken=' + this.accessToken, 'POST', obj, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Share ID: ' + response.id);
                }
            }
			);
            return true;
        },
        postRate: function (rating) {
            var url = this.permalink(), videoSeries = this.ogVideoSeries();
            if (!this.isSocialOn() || !url || !rating) { return false; }

            var obj = {
                value: rating,
                scale: 5,
                normalized_value: 1
            };

            switch (this.ogType()) {
                case 'video.movie':
                    obj.movie = url;
                    break;
                case 'video.episode':
                    if (!videoSeries) { return false; }
                    obj.episode = url;
                    obj.series = videoSeries;
                    break;
                case 'video.tv_show':
                    obj.tv_show = url;
                    break;
                case 'video.other':
                    obj.other = url;
                    break;
                default:
                    return false;
            }

            FB.api('/me/video.rates?access_token=' + this.accessToken, 'POST', obj, function (response) {
                if (!response || response.error) {
                    if (response.error.code === 3501) {
                        var errorMsg = response.error.message.toLowerCase();
                        if (errorMsg) {
                            var actionID = errorMsg.substr(errorMsg.lastIndexOf('action id: ') + 11, errorMsg.length);
                            // Make sure we only have the id number - force it back to a string.
                            FB.api(String(parseInt(actionID, 10)), 'POST', obj, function (data) {
                                if (!data || data.error) {
                                    console.log(data.error);
                                } else {
                                    console.log('Updated Rate ID: ' + data);
                                }
                            });
                        }
                    }
                } else {
                    console.log('Rate ID: ' + response.id);
                }
            });
            return true;
        },
        postWatchlist: function (permalink, ogtype, series) {
            var url = permalink || this.permalink(), videoType = ogtype || this.ogType();
            if (!this.isSocialOn() || !url) { return false; }

            var obj = {
                created_time: (new Date()).ISO8601(),
                expires_in: 10
            };

            switch (videoType) {
                case 'video.movie':
                    obj.movie = url;
                    break;
                case 'video.episode':
                    obj.episode = url;
                    if (series) {
                        obj.series = series;
                    }
                    break;
                case 'video.tv_show':
                    obj.tv_show = url;
                    break;
                case 'video.other':
                    obj.other = url;
                    break;
                default:
                    return false;
            }

            FB.api('/me/video.wants_to_watch?access_token=' + this.accessToken, 'POST', obj, function (response) {
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    console.log('Add to Watchlist ID: ' + response.id);
                }
            });
            return true;
        },
        requestFriends: function () {
            var obj = {
                method: 'apprequests',
                message: 'Crackle + Facebook'
            };

            FB.ui(obj, function (response) {
                console.log(response);
            });
        }
    },
    twitter: {},
    youtube: {},
    googlePlus: {},
    getGlue: {}
};

// Crackle Media / Channel Objects
Crackle.media = {
    nowPlaying: {
        _channelId: null,
        _mediaId: null,
        _mediaIdInitial: null,
        _strMediaList: null,
        _previousMediaElt: null
    },
    // Updates the NowPlaying page
    updateWatchPage: {
        init: function (mediaId, playlistId) {
            if (!mediaId || !playlistId) { return false; }
            this.selectMedia(mediaId, playlistId);
            this.loadNowPlaying(mediaId);
            this.loadAboutChannel(mediaId);
            this.loadShareThisVideo(mediaId);
            Crackle.social.facebook.loadComments();
            $jq('.watchlist').removeClass('landing');
            $jq('html, body').animate({ scrollTop: 0 }, 1000);
            Crackle.media.playMedia(mediaId, 'o=12&fpl=' + playlistId + '&fx=');
        },
        selectMedia: function (mediaId, playlistId, fScroll) {
            var eltLI = $jq('#playlist' + playlistId + ' ol li');

            if (eltLI.length === 0) {
                eltLI = $jq('div[id^=playlist]').not('div[id^=playlistRSS]').find('ol li');
            }

            if (eltLI.length > 0) {
                for (var i = 0; i < eltLI.length; i++) {
                    var attrID = eltLI[i].getAttribute('g:id');
                    if (!attrID) { continue; }
                    //console.log(eltLI[i]);
                    var fCurrent = (parseInt(attrID, 10) === mediaId);
                    if (fCurrent && !$jq(eltLI[i]).hasClass('selectedItem')) {
                        $jq(eltLI[i]).addClass('selectedItem');

                        // Check for previous media element -- NOT NEEDED FOR JQUERY
                        //if (Crackle.media.nowPlaying._previousMediaElt) { }
                        $jq(_eltMediaPrevious).removeClass('selectedItem');
                        _eltMediaPrevious = eltLI[i];
                    }

                    if (fScroll && fCurrent) {
                        var currentPage = 0;
                        return currentPage;
                    }
                }
            }
        },
        loadNowPlaying: function (mediaId) {
            if (!mediaId) { return false; }
            if ($jq('#nowPlaying').html() !== null) {
                $jq.ajax({
                    url: '/Play/NowPlaying.aspx?id=' + mediaId + '&channelId=' + $jq('#channelId').val(),
                    cache: (_isIE ? false : true),
                    async: false,
                    success: function (msg) {
                        $jq('#nowPlaying').html(msg);
                        document.title = $jq('#doc-title').html();
                        //set the isrequestfromchannelhome value to false if the user selected an individual video
                        var currentLocation = window.location.href;
                        if (currentLocation.indexOf('#') !== -1) {
                            $jq('#isrequestfromchannelhome').html('False');
                        }
                        if (!Crackle.social.facebook.isInitialized) { return false; }
                        Crackle.social.facebook.parseXFBML($jq('#fb_like')[0]);
                        var url = Crackle.social.facebook.permalink();
                        $jq('#actionCommentCount').html('<fb:comments-count href="' + url + '"></fb:comments-count>');
                    }
                });
            }
        },
        loadAboutChannel: function (mediaId) {
            if (!mediaId) { return false; }
            if ($jq('#content-about').html() !== null) {
                $jq.ajax({
                    url: '/browse/AboutChannel.aspx?id=' + mediaId + '&channelId=' + $jq('#channelId').val(),
                    cache: (_isIE ? false : true),
                    async: false,
                    success: function (msg) {
                        $jq('#content-about').html(msg);
                        var collectionDescription = $jq('.collections-description');
                        if (collectionDescription.length > 0) {
                            collectionDescription.truncate({
                                max_length: 200,
                                more: Crackle.str.readMore,
                                less: Crackle.str.hideDetails
                            });
                        }
                    }
                });
            }
        },
        loadShareThisVideo: function (mediaId) {
            if (!mediaId) { return false; }
            if ($jq('#content-share').length == 1) {
                $jq.ajax({
                    url: '/browse/ShareVideo.aspx?id=' + mediaId + '&cid=' + ($jq('#channelId').val() || 0),
                    cache: (_isIE ? false : true),
                    async: false,
                    success: function (response) {
                        $jq('#content-share .content').html(response);
                    }
                });
            }
        }
    },
    addToWatchlist: function (mediaConfig, callback) {
        var channelId = mediaConfig.channelId,
            mediaId = mediaConfig.mediaId,
            permalink = mediaConfig.permalink,
            ogType = mediaConfig.ogType,
            series = mediaConfig.series;

        return RequireLogin(function () {
            $jq.ajax({
                url: '/Members/AddObjectToPlaylist.ashx?channelId=' + channelId + "&mediaItemId=" + mediaId,
                success: function () {
                    if (callback) { callback(); }
                    Crackle.stats.omniture.trAddObjectToQueue(this, s, 'favorites', '', mediaId, '', '');
                    if (permalink && ogType) {
                        Crackle.social.facebook.postWatchlist(permalink, ogType, (series ? series : null));
                    }
                }
            });
        }, 'add-to-watchlist');
    },
    removeFromWatchlist: function (mediaConfig, callback) {
        var channelId = mediaConfig.channelId,
            mediaId = mediaConfig.mediaId,
            playlistId = mediaConfig.playlist;

        $jq.ajax({
            url: '/Members/RemoveObjectFromPlaylist.ashx?channelId=' + channelId + '&mediaItemId=' + mediaId + '&playlistId=' + playlistId,
            success: function () {
                Crackle.stats.omniture.trRemoveFromWatchlist(channelId, mediaId);
                if (callback) { callback(); }
            }
        });
    },
    subscribeToNotifications: function (channelId, callback) {
        return RequireLogin(function () {
            $jq.ajax({
                url: '/play/panels/subscribe.ashx?cid=' + channelId,
                success: function () {
                    if (callback) { callback(); }
                    Crackle.stats.omniture.trSubscribeToChannel(channelId);
                }
            });
        }, 'subscribe');
    },
    removeFromNotifications: function (mediaConfig, callback) {
        var notificationId = mediaConfig.notificationId,
            channelId = mediaConfig.channelId;
        $jq.ajax({
            url: '/Members/UnsubscribeMe.ashx?id=' + notificationId,
            success: function () {
                if (callback) { callback(); }
                Crackle.stats.omniture.trUnSubscribeToChannel(channelId);
            }
        });
    },
    rateMedia: {},
    // NEEDS TO BE BROKEN OUT INTO MEDIA OBJECT INSTEAD, HAS MULTIPLE USE CASES
    playMedia: function (mediaId, strMediaList, strAdRegion, strQueryReferrerXml, fConvivaLive, strAdOnTracking, strJumpTime, fPopOut, fAutoPlayDisabled) {
        if (!mediaId) { return false; }

        $jq('#currentMediaID').html(mediaId);
        mediaId = parseInt(mediaId, 10);

        // don't do anything if nothing's changed
        if (mediaId === _idMedia && strMediaList === _strMediaList) { return false; }

        if (!strMediaList) {
            strMediaList = '';
        }

        // remember the video we're now playing
        //Crackle.media.nowPlaying._mediaId = mediaId;	// global
        _idMedia = mediaId;

        // if we didn't set a media ID when loading the player, remember this now for the history
        if (!_idMediaInitial) {
            _idMediaInitial = _idMedia;
        }

        // add this video play to the history, if necessary
        if (_fAddHistory) {
            var state = '';
            if (_idMedia) {
                state += 'id=' + _idMedia;
            }

            if (strMediaList) {
                if (state) {
                    state += '&';
                }
                state += 'ml=' + encodeURIComponent(strMediaList);
            }

            window.location.hash = '#' + state;
        }

        // subsequent plays should go in the history
        _fAddHistory = true;

        var eltPlayer = document.getElementById(_idFlashPlayer);
        if (eltPlayer) {
            // if we have a media ID, then play that, otherwise just play the list from the start
            if (mediaId) {
                if (eltPlayer.PlayMedia) { eltPlayer.PlayMedia(mediaId, strMediaList, strJumpTime); }
            } else {
                if (eltPlayer.PlayMediaList) { eltPlayer.PlayMediaList(strMediaList); }
            }
            return false;
        }

        var _width = '642'; var _height = '365';
        if (fPopOut) {
            _width = '100%';
            _height = '100%';
        }

        var so = new SWFObject('/flash/ReferrerRedirect.ashx', _idFlashPlayer, _width, _height, '10.2.0', '#000000', 'high', window.location);
        if (!_version.IsMac) {
            so.useExpressInstall('/flash/expressinstall.swf');
        }

        so.addParam('wmode', 'transparent');
        so.addParam('allowFullScreen', 'true');
        so.addParam('allowScriptAccess', 'always');

        // pass in various flashvars to the player:
        if (!isNaN(mediaId) && mediaId > 0) {
            so.addVariable('id', mediaId);
        }

        if (strMediaList) {
            so.addVariable('ml', encodeURIComponent(strMediaList));
        }

        if (strAdRegion || _strAdRegion) {
            if (_strAdRegion) { strAdRegion = _strAdRegion; }
            so.addVariable('ar', encodeURIComponent(strAdRegion));
        }

        if (strQueryReferrerXml || _strQRXML) {
            if (_strQRXML) { strQueryReferrerXml = _strQRXML; }
            so.addVariable('qrxml', encodeURIComponent(strQueryReferrerXml));
        }

        if (fConvivaLive === 0 || _fConvivaLive === 0) {
            if (_fConvivaLive === 0) { fConvivaLive = _fConvivaLive; }
            so.addVariable('convivaLive', fConvivaLive);
        }

        var _str_utm_source = ParseQueryString(window.location.href.split('?')[1])['utm_source'];
        if (typeof (strAdOnTracking) != 'undefined' && strAdOnTracking == _str_utm_source) {
            so.addVariable('useAdOn', 1);
        }

        if (fPopOut) {
            so.addVariable('isPopup', 1);
        }


        if (fAutoPlayDisabled) {
            so.addVariable('ap', 0);
        }

        //// QueryReferrer is broken on Safari/Windows, force the external site
        //if (_version.IsSafari && !_version.IsMac) {
        //    so.addVariable('site', 16);
        //}

        so.addVariable('loc', _currentLocale); // Current Locale
        so.addVariable('rootURL', encodeURIComponent('http://' + location.host));
        so.addVariable('ctrl', _idFlashPlayer); // tell the player the name of its control
        so.addVariable('internal', 1);
        if (!isNaN(strJumpTime) && typeof (strJumpTime) !== 'undefined') {
            var strJumpTimeinSec;
            if (strJumpTime.toString().indexOf(".") > 0) {
                strJumpTimeinSec = parseInt(strJumpTime.toString().substr(0, strJumpTime.toString().indexOf('.')), 10);
            } else {
                strJumpTimeinSec = strJumpTime;
            }
            // jump 3 sec before
            if (!isNaN(strJumpTimeinSec) && strJumpTimeinSec > 3) {
                so.addVariable('sindex', strJumpTimeinSec - 3);
            }
        } else {
            var furthestPointOb = GetFurthestProgressPoint(mediaId);
            if (furthestPointOb != null && !isNaN(furthestPointOb.furthestPointInSeconds)) {
                so.addVariable("sindex", furthestPointOb.furthestPointInSeconds);
                furthestPointOb.trackInOmniture();
            }
        }

        if (useWidevine) {
            widevine.init();
            if (!isWidevinePlugin()) { return false; }
        }

        if (so.write('FlashPlayerContainer') && isFlashPlayerPlugin()) {
            // notify the player of any login status changes on the page
            _delegateLoginStatusChanged.Register(
				function (fLoggedIn) {
				    var eltPlayer = document.getElementById(_idFlashPlayer);
				    if (eltPlayer && eltPlayer.changeLoginStatus) {
				        eltPlayer.changeLoginStatus(fLoggedIn);
				    }
				}
			);
        } else {
            // FAIL: show the no-flash error
            var elt = document.getElementById('FlashPlayerContainer');

            if (_isMobile) {
                var msgArr = ['<div id="noFlashMessage">'];
                if (_isLatAm) {
                    if (_currentLocale === 'pt-br') {
                        msgArr.push('<span>O aplicativo do Crackle é necessário para visualizar o vídeo.<br /> Por favor, faça o download agora de graça.</span>');
                    } else {
                        msgArr.push('<span>Necesitas la aplicación de Crackle para ver éste video.<br /> Por favor descárgala gratis.</span>');
                    }
                } else {
                    msgArr.push('<span>The Crackle app is required to view video.<br /> Please download it now for free.</span>');
                }

                if (_isIOS) {
                    msgArr.push('<a class="btnBlack downloadNow" href="https://itunes.apple.com/us/app/id377951542">Download App</a>');
                } else {
                    msgArr.push('<a class="btnBlack downloadNow" href="market://details?id=com.gotv.crackle.handset">Download App</a>');
                }

                msgArr.push('</div>');
                $jq(elt).html(msgArr.join(''));
            } else {
                if (_isLatAm) {
                    if (_currentLocale === 'pt-br') {
                        elt.innerHTML = '<a href="http://get.adobe.com/flashplayer/"><img src="/styles/themes/pt-BR/default/images/get_flash_player.jpg" alt="Clique para instalada Adobe&acute;s Flash Player"/></a>';
                    } else {
                        elt.innerHTML = '<a href="http://get.adobe.com/flashplayer/"><img src="/styles/themes/es/default/images/get_flash_player.jpg" alt="Haz clic para descargar ahora" /></a>';
                    }
                } else {
                    elt.innerHTML = '<a href="http://get.adobe.com/flashplayer/"><img src="/styles/themes/default/images/get_flash_player.jpg" alt="Click here to install Adobe&acute;s Flash Player"/></a>';
                }
            }
            AddClass(elt, 'noflash');
        }

        return false;
    }
};

Crackle.user = {
    ID: null,
    NickName: "",
    //fbid: "",
    avatar: "",
    newuser: null,
    watchlistCount: null,
    watchlistId: null,
    init: function (_id, _name) {
        this.ID = _id;
        this.NickName = _name;
        //this.fbid = _fbid;
        return this;
    },
    IsLoggedIn: function () { return !!this.ID; },
    DisplayUser: function () {
        var fLoggedIn = this.IsLoggedIn();
        $jq('body').addClass('loggedIn').trigger('login');
        var _eleusernameLink = $jq('#linkEditProfile');
        if (_eleusernameLink.length == 1) {
            _eleusernameLink.attr('href', '/members/editprofile.aspx');
        }

        var _eleuserAvatar = $jq('#facebookAvatar');
        _eleuserAvatar.attr('src', this.avatar);
        if (this.watchlistCount)
            $jq(".user-queue-count").html(this.watchlistCount);

    },
    loadUser: function (req) {
        var error;
        error = req.error;
        if (error == 0) {
            if (!window.location.href.match(/Login\.aspx/i) && !window.location.href.match(/JoinCrackle\.aspx/gi)) {
                this.ID = req.user.id;
                this.NickName = req.user.name;
                //this.fbid = req.user.fbid;
                this.avatar = req.user.avatar;
                this.watchlistCount = req.user.wc;
                this.newuser = req.user.newuser;

                if (this.newuser && this.newuser == '0') {
                    Crackle.social.facebook.handleNewUser();
                }

                _user = Crackle.user.init(this.ID, this.NickName);
                _user.DisplayUser();
                _delegateLoginStatusChanged.Invoke(true);

                if (parent.OnLoggedIn) {
                    parent.OnLoggedIn();
                }

            } else {
                console.log(req);
                this.ID = req.user.id;
                this.NickName = req.user.name;
                //this.fbid = req.user.fbid;
                this.avatar = req.user.avatar;
                this.watchlistCount = req.user.wc;
                this.newuser = req.user.newuser;

                if (this.newuser && this.newuser == '0') {
                    setCookie('fbNewUser', 'true', 1, '/');
                }


                _user = Crackle.user.init(this.ID, this.NickName);
                _user.DisplayUser();

                var rgParts = window.location.href.split("?");
                var qs = ParseQueryString(rgParts[1]);

                // TODO: Add the functionality to add to queue after login and redirect
                /*if (typeof(qs["channelId"]) != "undefined" || typeof(qs["mediaId"]) != "undefined") {
                var chanId = null;
                if (typeof(qs["channelId"]) != "undefined")
                chanId = qs["channelId"];
                var mId = null;
                if (typeof(qs["mediaId"]) != "undefined")
                mId = qs["mediaId"];
                AddObjectToQueue(chanId, mId);
                }*/

                if (typeof (qs["urlReturn"]) != "undefined") {
                    var ref = qs["urlReturn"];
                    if (rgParts.length > 1) {
                        //ref = ref + '?';
                        for (i = 2; i < rgParts.length; i++) {
                            if (ref.indexOf("?") == -1) {
                                ref = ref + '?';
                            }
                            ref = ref + rgParts[i];
                        }
                    }
                    window.location.href = ref; //  qs["urlReturn"]
                } else {
                    window.location.href = "http://" + window.location.host;
                }
            }
            /** Omniture code to track login **/
            s.linkTrackVars = 'events,prop7,eVar17,eVar18,eVar19'; s.linkTrackEvents = 'event8';
            s.events = 'event8'; s.prop7 = 'Logged In';
            s.eVar17 = s.getTimeParting('h', '-8'); // Set hour 
            s.eVar18 = s.getTimeParting('d', '-8'); // Set day
            s.eVar19 = s.getTimeParting('w', '-8'); // Set Weekend / Weekday
            s.trackingServer = 'omn.crackle.com'; s.trackingServerSecure = 'omn.crackle.com'; s.tl(this, 'o', 'Login');
            Crackle.dialogs.login.close();
        } else {
            //if(error == 'NEW_FACEBOOK_USER') {
            //document.location.href = '/accounts/create/JoinCrackleFacebook.aspx';
            //return;
            //} else if
            //reload captchIt image when creating new account fails
            if (error == 'failed captchIt') {
                error = _registerCaptcha; // Enter Captcha
                ReloadImage();

            } else if (error == 'ineligible') {
                setCookie('ineligible', 'ineligible', 1, "/");
                ShowPanel('/accounts/ineligible.htm');
                return false;
            } else if (error == _registerConfirmEmail) { // Confirm Email
                var id = req.id;
                var emailtoken = req.emailtoken;
                openLoginEmailConfirmation(id, 'login', emailtoken);
                return false;
            }
            $jq('#errorMsg').html(error);
            $jq('#errorMsg').addClass("errorMsg");
        }

        return (error == 0);
    },
    login: function (isSecure, get) {
        var eltError = $jq('#errorMsg');

        var eltUsername = $jq('#usernameText');
        var strUsername = trim(eltUsername.val());

        if (eltUsername.fDefault || !IsValidEmail(strUsername)) {
            eltError.html(_registerValidEmailAddress); // Valid email address
            eltError.addClass('errorMsg');
            return false;
        }

        var eltPassword = $jq('#passwordText');
        var strPassword = eltPassword.val();
        if (eltPassword.fDefault || !strPassword) {
            eltError.html(_registerEnterPassword); // Enter password
            eltError.addClass('errorMsg');
            return false;
        }

        var strURL = (isSecure ? 'https://' : 'http://') + window.location.host + "/accounts/login.ashx?";


        //	if (GetOfflineQueue() != null && GetOfflineQueue().length > 0) {
        //	    strURL += "&queue=" + GetOfflineQueue();
        //	}

        //checked
        var rememberMe = $jq('#chkRememberMe').is(':checked');
        if (rememberMe == true) {
            strURL += "rmmbrme=true";
        }
        strURL += "&callback=?";
        if (get) {
            var options = { path: '/' };
            (isSecure) ? options.secure = true : options.secure = false;
            $jq.cookie("login", strUsername, options);
            $jq.cookie("pwd", strPassword, options);
            $jq.getJSON(strURL, { format: 'json' })
            .done(function (r) {
                Crackle.user.loadUser(r);
            });
        } else {
            $jq.ajax({
                type: 'POST',
                url: strURL,
                data: { un: encodeURIComponent(strUsername), pw: encodeURIComponent(strPassword) },
                dataType: "jsonp",
                success: function (r) { Crackle.user.loadUser(r); },
                error: function (XMLHttpRequest, textStatus, errorThrown) { }
            });
        }
        return false;
    }
}

Crackle.cwapp = {
    install: function () {
        chrome.webstore.install();
        this.close();
    },
    close: function () {
        $jq('#cwappModal').dialog('close');
    },
    openLog: function () {
        $jq('#cwappOpenLog').trigger('click');
    }
};

Crackle.slideshow = {
    engine: null,
    navArrows: null,
    slideCover: null,
    slideControls: null,
    proceedToNextSlide: false,
    hideSlideControls: false,
    hasIEBeenReset: false,
    cursorPos: {
        x: 0, y: 0,
        last: { x: 0, y: 0 }
    },
    init: function (slideshowConfig) {
        var _this = this, isIE9 = navigator.userAgent.indexOf('MSIE 9.0') > -1;
        this.slideCover = $jq('.slideshow');
        this.navArrows = $jq('#slideshow-arrows');
        this.slideControls = $jq('.slideshow-controls');

        // Reset for IE and browsers which do not support css animations
        if (!Modernizr.cssanimations && !_this.hasIEBeenReset) {
            this.navArrows.fadeOut(0);
            this.slideControls.fadeOut(0);
            this.hasIEBeenReset = true;
        }

        if (Modernizr.cssanimations) {
            this.navArrows.addClass('animateFades');
            this.slideControls.addClass('animateFades');
        }

        function showNavArrows() {
            if (!Modernizr.cssanimations) {
                _this.navArrows.fadeIn(500);
            } else {
                _this.navArrows.addClass('visible');
            }
        }

        function showSlideControlsConditional() {
            if (_this.navArrows.find('.hoverState').length === 0 && !_this.hideSlideControls) {
                showSlideControls();
            }
        }

        function showSlideControls() {
            if (!Modernizr.cssanimations) {
                _this.slideControls.fadeIn(500);
            } else {
                _this.slideControls.addClass('visible');
            }
        }

        function hideSlideControls() {
            if (!Modernizr.cssanimations) {
                _this.slideControls.fadeOut(500);
            } else {
                _this.slideControls.removeClass('visible');
            }
        }

        function hideAllSlideOverlays() {
            if (!Modernizr.cssanimations) {
                _this.navArrows.fadeOut(500);
                _this.slideControls.fadeOut(500);
            } else {
                _this.navArrows.removeClass('visible');
                _this.slideControls.removeClass('visible');
            }
        }

        this.bouncer = Crackle.utils.debounce(function () {
            hideAllSlideOverlays();
            _this.proceedToNextSlide = true;

            // Set delay of 3 seconds to proceed to the next slide
            setTimeout(function () {
                if (_this.proceedToNextSlide) {
                    _this.engine.cycle('next').cycle('resume');
                }
            }, 3000);
        }, (slideshowConfig.hoverDelay ? slideshowConfig.hoverDelay : 4000));

        this.engine = $jq('#crackleSlideshow').cycle({
            fx: 'fade',
            timeout: (slideshowConfig.slideDuration ? slideshowConfig.slideDuration : 10000),
            pager: '.slideshow-nav',
            pagerAnchorBuilder: function (idx, slide) {
                return '.slideshow-nav a:eq(' + idx + ')';
            },
            pauseOnPagerHover: true,
            before: function (curr, next, opts) {
                _this.getSlideSponsor(next, slideshowConfig.adConfig);
            }
        });

        this.slideCover.hoverIntent({
            over: function (evt) {
                var slideHoverTimer = 0;
                showNavArrows();
                showSlideControlsConditional();
                _this.bouncer();

                _this.slideCover.bind('mousemove', function (evt) {
                    clearTimeout(slideHoverTimer);
                    _this.cursorPos.x = evt.pageX;
                    _this.cursorPos.y = evt.pageY;

                    slideHoverTimer = setTimeout(function () {
                        _this.cursorPos.last.x = evt.pageX;
                        _this.cursorPos.last.y = evt.pageY;
                    }, 4000);

                    if ((_this.cursorPos.last.x !== _this.cursorPos.x) || (_this.cursorPos.last.y !== _this.cursorPos.y)) {
                        showNavArrows();
                        showSlideControlsConditional();
                    }

                    _this.engine.cycle('pause');
                    _this.proceedToNextSlide = false;
                    _this.bouncer();
                });
            },
            interval: 100,
            timeout: 250,
            out: function (evt) {
                hideAllSlideOverlays();
                _this.slideCover.unbind('mousemove');
            }
        });

        this.navArrows.find('a').bind('click', function () {
            var direction = $jq(this).data('direction');
            s.tl(this, 'o', 'slide-navigation:' + direction);
            _this.engine.cycle(direction);
        });

        this.navArrows.find('a').hoverIntent({
            over: function () {
                $jq(this).addClass('hoverState');
                _this.hideSlideControls = true;
                hideSlideControls();
            },
            interval: 100,
            timeout: 250,
            out: function () {
                $jq(this).removeClass('hoverState');
                _this.hideSlideControls = false;
                showSlideControls();
            }
        });

        this.slideCover.delegate('.item-in-watchlist, .item-in-notifications', {
            mouseover: function () {
                $jq(this).text(Crackle.str.remove);
            },
            mouseout: function () {
                var elem = $jq(this);
                elem.text((elem.hasClass('item-in-watchlist') ? Crackle.str.inMyWatchlist : Crackle.str.notified));
            }
        });

        this.slideCover.delegate('a.add-to-watchlist-btn, a.notify-me-btn', 'click', function (evt) {
            var elem = $jq(this);
            var mediaConfig = elem.data();
            if (elem.hasClass('add-to-watchlist-btn')) {
                var count = $jq('.user-queue-count');
                if (elem.hasClass('item-in-watchlist')) {
                    Crackle.media.removeFromWatchlist(mediaConfig, function () {
                        elem.removeClass('item-in-watchlist');
                        elem.text(Crackle.str.addToWatchlist);
                        count.text(Number(count.html()) - 1);
                    });
                    return false;
                } else {
                    Crackle.media.addToWatchlist(mediaConfig, function () {
                        elem.addClass('item-in-watchlist');
                        elem.text(Crackle.str.inMyWatchlist);
                        count.text(Number(count.html()) + 1);
                    });
                }
            } else {
                if (elem.hasClass('item-in-notifications')) {
                    Crackle.media.removeFromNotifications(mediaConfig, function () {
                        elem.removeClass('item-in-notifications');
                        elem.text(Crackle.str.notifyMe);
                    });
                } else {
                    Crackle.media.subscribeToNotifications(mediaConfig.channelId, function () {
                        elem.addClass('item-in-notifications');
                        elem.text(Crackle.str.notified);
                    });
                }
            }
            s.tl(this, 'o', ('slide-controls:' + (elem.hasClass('item-in-watchlist') || elem.hasClass('item-in-notifications') ? 'remove-from' : 'add-to') + (elem.hasClass('add-to-watchlist-btn') ? '-watchlist' : '-notifications')));
            evt.preventDefault();
        });

        this.slideCover.delegate('.arrowContainer', {
            mouseover: function () {
                var css = {}, elem = $jq(this);
                css[elem.hasClass('navFW') ? 'right' : 'left'] = '13px';
                elem.find('span').animate(css, 100);
            },
            mouseout: function () {
                var css = {}, elem = $jq(this);
                css[elem.hasClass('navFW') ? 'right' : 'left'] = '10px';
                setTimeout(function () {
                    if (!elem.hasClass('hoverState')) { elem.find('span').animate(css, 100); }
                }, 250);
            }
        });

        $jq('body').bind('login', this.updateSlideControls).bind('logout', function () {
            $jq('.item-in-watchlist, .item-in-notifications').each(function () {
                var elem = $jq(this);
                if (elem.hasClass('item-in-watchlist')) {
                    elem.removeClass('item-in-watchlist').text(Crackle.str.addToWatchlist);
                } else {
                    elem.removeClass('item-in-notifications').text(Crackle.str.notifyMe);
                }
            });
        });
    },
    getSlideSponsor: function (slide, adConfig) {
        var ad_el = $jq(slide).find("div[id*='adSponsorLogo']");
        if (ad_el.length > 0) {
            var ad_el_id = $jq(ad_el).attr("id");
            var slide_id = ad_el_id.substring(13, ad_el_id.length);
            if ($jq(ad_el).html() == "") {
                var ad = new AdElementNew(ad_el_id, adConfig.server, adConfig.network_id, adConfig.profile, ((dfpSiteName == "opus") ? adConfig.adSite : dfpSiteName), adConfig.siteSection, "slide=" + slide_id, "SponsorLogo");
                ad.InitializeStatic();
            }
        }
    },
    updateSlideControls: function () {
        $jq.ajax({
            url: '/App/getSlideControlsUserStatus.ashx?channelId=' + $jq('#crackleSlideshow').data('channelId'),
            success: function (response) {
                if (response && response.slideControlsStatus) {
                    var userStatus = response.slideControlsStatus,
                        playlistId = userStatus.playlistId || 0;

                    $jq.each(userStatus.slides, function () {
                        var obj = this, elem = $jq('[data-slide-id="' + obj.slideId + '"]');

                        if (obj.isInWatchlist) {
                            var watchlistBtn = elem.find('a.add-to-watchlist-btn');
                            watchlistBtn.addClass('item-in-watchlist').text(Crackle.str.inMyWatchlist).data('playlist', playlistId);;
                        }

                        if (obj.isInNotifications) {
                            var notifyBtn = elem.find('a.notify-me-btn');
                            notifyBtn.addClass('item-in-notifications').text(Crackle.str.notified).data('notificationId', obj.notificationId);;
                        }
                    });
                }
            }
        });
    }
};

Crackle.dialogs = {
    initSmartAppBanner: function () {
        $jq.smartbanner({
            title: 'Crackle',
            author: 'Crackle, Inc.',
            price: 'FREE',
            appStoreLanguage: 'us',
            inAppStore: 'On the App Store',
            inGooglePlay: 'In Google Play',
            icon: '/styles/crackle_app_store_icon.png',
            iconGloss: false,
            button: 'VIEW',
            scale: 'auto',
            speedIn: 300,
            speedOut: 400,
            daysHidden: 0,
            daysReminder: 90,
            force: null
        });
    },
    newToCrackle: function () {
        $jq('#newToCrackle').dialog({
            modal: true,
            width: 540,
            dialogClass: 'newToCrackle',
            open: function () {
                $jq('.ui-widget-overlay, .closeDialog').bind('click', function (evt) {
                    if (!$jq(this).hasClass('dialogRegister')) {
                        evt.preventDefault();
                    }
                    $jq('#newToCrackle').dialog('close');
                });
            },
            close: function () {
                setCookie('newToCrackle', 'false', 365, '/');
            }
        });
    },
    chromeWebApp: function () {
        $jq('#cwappModal').dialog({
            autoOpen: true,
            width: 'auto',
            modal: true,
            autoResize: true,
            closeText: _closeText,
            open: function () {
                if (typeof PauseVideo != 'undefined') {
                    PauseVideo();
                }
                $jq('#FlashPlayerContainer').css('display', 'none');
            },
            close: function () {
                setCookie('cw_app', 'true', 7, '/');
                $jq('#FlashPlayerContainer').css('display', 'block');
                if (typeof PlayVideo != 'undefined') {
                    PlayVideo();
                }
            },
            buttons: {
                "Close": function () {
                    $jq(this).dialog('close');
                }
            }
        });
    },
    login: {
        init: function (isSecure) {
            var currentPage = s.pageName;
            $jq("#signin").dialog({
                autoOpen: false,
                dialogClass: 'new-ui-dialog',
                modal: true,
                //autoResize: true,
                width: 741,
                open: function (event, ui) {
                    $jq(".bt-wrapper").remove();
                    var s = "<form autocomplete=\"OFF\" id=\"loginForm\" onsubmit=\"return Crackle.user.login(" + isSecure + ",true);\">";
                    s += "<div class=\"signin-form\"><div class=\"signin-facebook\">";
                    s += "<div class=\"facebook-header\">" + Crackle.str.signInUsingFB + "</div>";
                    s += "<div class=\"facebook-details\">" + Crackle.str.recommended + "</div>";
                    s += "<div class=\"facebook-button\"><a href=\"#\" onclick=\"Crackle.social.facebook.login();\"></a></div></div>";
                    s += "<div class=\"signin-divider\"><div class=\"signin-divider-line\"></div>";
                    s += "<div class=\"signin-divider-or\">" + Crackle.str.or + "</div></div>";
                    s += "<div class=\"signin-user\"><div class=\"form-header\">" + Crackle.str.signInToCrackle + "</div>";
                    s += "<div class=\"form-content\"><div class=\"form-label\"><span>" + Crackle.str.email + "</span></div><div class=\"form-input\"><input type=\"text\" name=\"username\" id=\"usernameText\" /></div>";
                    s += "<div class=\"form-label\"><span>" + Crackle.str.password + "</span></div><div class=\"form-input\"><input type=\"password\" name=\"password\" id=\"passwordText\" /></div>";
                    s += "<div class=\"forgot-password\"><a href=\"/accounts/login/FetchPassword.aspx\" name=\"&lid=forgot-password&lpos=login-overlay\" onclick=\"OmnTrackCustomLink('Login Forgot Password');\">" + Crackle.str.forgotPassword + "</a></div>";
                    s += "<div class=\"rememberme\"><input type=\"checkbox\" id=\"chkRememberMe\" checked=\"checked\" /><label for=\"chkRememberMe\">" + Crackle.str.rememberMe + "</label></div>";
                    s += "<div id=\"errorMsg\"></div>";
                    s += "<div class=\"signin\"><input type=\"submit\" value=\"" + Crackle.str.signIn + "\" class=\"btnOrange\" /></div>";
                    s += "<div class=\"register\">" + Crackle.str.or + " <a href=\"/accounts/create/JoinCrackle.aspx?urlReturn=" + window.location.href + " \" name=\"&lid=register&lpos=login-overlay\" onclick=\"OmnTrackCustomLink('Login Register');\">" + Crackle.str.registerForCrackle + "</a></div></div></div></form>";
                    $jq("#signin").html(s);
                    signindialog = true;
                    $jq("#signin input:eq(0)").focus();
                    if (typeof (PauseVideo) != "undefined")
                        PauseVideo();
                },
                close: function (event, ui) {
                    var options = { path: '/' };
                    (isSecure) ? options.secure = true : options.secure = false;
                    $jq.cookie("login", null, options);
                    $jq.cookie("pwd", null, options);

                    $jq("#signin").html("");
                    signindialog = false;
                    if (typeof (PlayVideo) != "undefined")
                        PlayVideo();
                    /* Omniture Tracking - set pageName to the current page after closing login overlay */
                    s.pageName = currentPage;
                },
                buttons: {
                    "Close": function () {
                        $jq(this).dialog("close");
                    }
                }
            });
        },
        open: function () {
            $jq("#signin").dialog('open');
            return false;
        },
        close: function () {
            $jq("#signin").dialog("close");
            return false;
        }
    }
};

Crackle.carousels = {
    buildCarousel: function (carouselType, config) {
        var nor = config.numOfRows ? config.numOfRows : 1;
        var nv = config.numVisible / nor;
        var carousel = new YAHOO.widget.Carousel(config.channelId, {
            numVisible: [nv, nor],
            animation: { speed: 0.25 },
            scrollIncrement: nv,
            numItems: config.itemCount
        });
        carousel.render();
        carousel.show();
        carousel.on('loadItems', function (elem) {
            switch (carouselType) {
                case 'home-featured':
                    break;
                case 'watchlist-sectional':
                    Crackle.carousels.getWatchlistItems.call(this, elem, config);
                    break;
                case 'my-watchlist':
                    break;
                case 'additional':
                    break;
                case 'one-sheet':
                    break;
                default: return;
            }
        });
    },
    getWatchlistItems: function (args, config) {
        var carousel = this;
        var channel = config.channelId.replace('watchlist_', '').replace('featured-watchlist-carousel_', '');
        var url = '/watchlist/sectional/WatchlistItems.ashx?channelId=' + channel + '&startindex=' + args.first + '&itemCount=' + args.num + (config.channelUrl ? ('&channelUrl=' + config.channelUrl) : '') + (config.omnitureVar ? ('&omn=' + config.omnitureVar) : '');
        $jq.ajax({
            url: url,
            success: function (json) {
                var template = Handlebars.compile($jq('#carousel-item').html());
                for (var i in json) {
                    var item = template(json[i]);
                    carousel.on('itemAdded', function (elem) {
                        BuildToolTip(this.getElementForItem(elem.newPos), json[i].mediaId, 0);
                        this.getElementForItem(elem.newPos).setAttribute('data-media-id', json[i].mediaId);
                    });
                    carousel.addItem(item);
                }
            },
            error: function (error) { console.log(error); }
        });
    }
};

// Crackle Player Objects
Crackle.player = {
    onVideoChanged: function () { }
};


// Crackle Advertisement Objects
Crackle.ads = {
    adElement: function () { }
};

// Crackle Utilities
Crackle.utils = {
    scrollTo: function (elem) {
        if (!elem) { return false; }
        $jq('html, body').animate({
            scrollTop: $jq('#' + elem).offset().top
        }, 200);
    },
    escRegEx: function (str) {
        if (!str) { return false; }
        var spChars = ['{', '}', '(', ')', '[', ']', '\'', '\"', '\\', '.', '/', '?', '$', '+', '^', '*', '|'];
        var regex = new RegExp('(\\' + spChars.join('|\\') + ')', 'g');
        return str.replace(regex, '\\$1');
    },
    isEmpty: function (str) {
        return !/[^\s]/.test(str);
    },
    clearTimeout: function (id) {
        if (typeof id === 'number') {
            clearTimeout(id);
            delete id; id = null;
        }
    },
    debounce: function (func, wait, immediate) {
        var timeout, self = this;
        return function () {
            var context = this, args = arguments;

            var later = function () {
                timeout = null;
                if (!immediate) { func.apply(context, args); }
            };

            if (immediate && !timeout) { func.apply(context, args); }
            self.clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    trackMouse: function (evt, callback) {
        if (!evt) { return false; }
        var cursorPos = { x: evt.pageX, y: evt.pageY };
        return !callback ? cursorPos : callback(cursorPos);
    },
    xFeed: function (url, format) {
        if (!url || !format) { return false; }
        var response = null;
        $jq.ajax({
            type: 'GET',
            async: false,
            dataType: format,
            url: url,
            success: function (res) {
                response = res;
            },
            error: function (res) {
                console.log('Something went wrong.');
            }
        });
        return response;
    },
    xPostMessage: function (evt, str) {
        // Usage: Crackle.utils.xPostMessage('evtName', 'test data');
        if (!evt || !str || (typeof $xPostMessage !== 'function')) { return false; }
        $xPostMessage({
            target: window.parent,
            type: evt,
            data: str,
            success: function (data) { },
            error: function (data) { console.log(data); }
        });
    },
    xListenMessage: function (evt, callback) {
        // Usage: Crackle.utils.xListenMessage('evtName', function(response) { });
        if (!evt || !callback || (typeof $xPostMessage !== 'function')) { return false; }
        $xPostMessage.bind(evt, callback);
    }
};

Authentication = {    
    // Given by Crackle
    PARTNER_KEYWORD:'HTADOJZIIDMPQKBR',
    PARTNER_ID:40,
   // PARTNER_KEYWORD : 'WTVVTQITDTWCKKPV',
   // PARTNER_ID : 14,
    
    GenerateToken : function( url ){
        var date            = new Date();
        var timestamp       = date.format('yyyyMMddHHmm');
        var encrypt_url     = url + "|" + timestamp;
        var hmac            = Crypto.HMAC( Crypto.SHA1, encrypt_url, this.PARTNER_KEYWORD );
        
        var token   = hmac + "|" + timestamp + "|" + this.PARTNER_ID + "|1";

        // console.log( "********" );
        // console.log( "Authorization: " + token.toUpperCase() );
        
        return token.toUpperCase();
    }
}
