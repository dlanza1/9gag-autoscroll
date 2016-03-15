/*
    Autoscroll your 9gag and save time!
*/

function NineGagAutoScroller() {
    // User parameters
    var AVG_TIME_PER_POST = 10000;
    var TIME_TO_SCROLL_TO_NEXT_POST = 500;
    var TIME_TO_SCROLL_THROUGH_LONG_POST = 10000;
    var TIME_BEFORE_SCROLLING_LONG_POST = 4000;
    var PLAY_VIDEO_TIMES = 3
    
    // Readable attribute
    this.isScrolling;

    // 9Gag specific constants
    var NAV_BAR_SELECTOR = '.nav-wrap';
    var POST_POSITION_KEY = 'data-evt';

    // Private attributes
    var currentPostIndex = 1;
    var scrollTimer;
    
    this.start = function() {
        currentPostIndex = 1;
        this.resume();
    };
    
    this.stop = function() {
        clearInterval(scrollTimer);
        this.isScrolling = false;
    };
    
    this.resume = function() {
        scrollTimer = setInterval(scrollToNextPost, AVG_TIME_PER_POST);
        this.isScrolling = true;
    };
    
    function scrollToNextPost() {
        console.log("WEEEEE, next post! - " + currentPostIndex);
        scrollToPost(currentPostIndex++);
    }

    function scrollToPost(index){
        var nextPostHead = postTopOffset(index);
        $('html,body').animate({scrollTop: nextPostHead}, TIME_TO_SCROLL_TO_NEXT_POST);
        if (isLongPost(index)) {
            console.log("Is a potato over here? i'll scroll gently!");
            setTimeout(scrollThroughLongPost, 
                       TIME_BEFORE_SCROLLING_LONG_POST,
                       index);
        }
        if (isVideoPost(index)) {
            duration = getVideoDuration(index);
            sleeptime = duration * 1000 * PLAY_VIDEO_TIMES;

            clearInterval(scrollTimer);
            console.log("Is a video! (" + duration + " seconds)");
            setTimeout(afterVideo, sleeptime);
        }
    }

    function afterVideo(){
        scrollTimer = setInterval(scrollToNextPost, AVG_TIME_PER_POST);
        scrollToNextPost();
    }
    
    function scrollThroughLongPost(index) {
        var nextPostLocation = postTopOffset(index + 1);
        $('html,body').animate({scrollTop: nextPostLocation}, 
                               TIME_TO_SCROLL_THROUGH_LONG_POST);
    }
    
    function retrievePost(index) {
        var post = $("[" + POST_POSITION_KEY + "*='position-" + index + "']");
        return post.parent().parent().parent();
    }

    function isVideoPost(index){
        try {
            var postVideoTag = retrievePost(index)[0].getElementsByTagName("div")[0].getElementsByTagName("a")[0].getElementsByTagName("div")[0].getElementsByTagName("video");
            return true;
        }catch (e) { 
            return false;
        }
    }

    function getVideoDuration(index){
        return retrievePost(index)[0].getElementsByTagName("div")[0].getElementsByTagName("a")[0].getElementsByTagName("div")[0].getElementsByTagName("video")[0].duration;
    }

    function isLongPost(index){
        var windowHeight = $(window).height() - $(NAV_BAR_SELECTOR).height();		
        var postHeight = retrievePost(index).height();
        return postHeight > windowHeight;
    }

    function postTopOffset(index) {
        var postTop = retrievePost(index).offset().top;
        var navbarHeight = $(NAV_BAR_SELECTOR).height();
        return postTop - navbarHeight;
    }
}

function ScrollerCommand(autoScroller) {
    // UI tools to controll the scroll
    // At The Moment:
    //     - a button to stop/resume the scroll
    // To come:
    //     - selectors for scroll settings (timers, ...)
    var COMMAND_HOLDER_SELECTOR = '.nav-menu ul.flex';
    var commandButtonId = "scrollerCommandButton";
    var button = $('<a/>')
                    .attr('id', commandButtonId)
                    ;
                    
    // Time between each check of the scroller initialisation
    var timeToWait = 1000;
    
    function onPauseClicked() {
        console.log("Ok Ok, i'll wait here");
        autoScroller.stop();
        showResumeButton();
    }
    
    function onResumeClicked() {
        console.log("Youhou, back in business!");
        autoScroller.resume();
        showPauseButton();
    }
    
    function showPauseButton(){
        button
            .text('Pause, I need a break!')
            .unbind()
            .click(onPauseClicked);
    }
    
    function showResumeButton(){
        button
            .text('Ok, let\'s go again!')
            .unbind()
            .click(onResumeClicked);
    }
   
    function showStatus(){
        if(typeof autoScroller.isScrolling === "undefined"){
            setTimeout(showStatus, timeToWait);
        } else {
            if (autoScroller.isScrolling){
                showPauseButton();
            } else {
                showResumeButton();
            }
            $(COMMAND_HOLDER_SELECTOR).append($('<li>').append(button));
        }
    }
    showStatus();
}

var scroller;
$(document).ready(function(){
    scroller = new NineGagAutoScroller();
    scroller.start()
    new ScrollerCommand(scroller);
});