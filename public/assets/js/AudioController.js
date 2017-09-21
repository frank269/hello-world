var listFile = [];
var currentIndex = -1;

function getCurrentPlayingIndex() {
    return currentIndex;
}

$(document).ready(function () {
    var isRepeat = false;
    var audioObj = $("<audio id='music'></audio>");
    var music = audioObj[0];
    var item = document.getElementById('0');
    var duration;
    var pButton = document.getElementById('pButton');
    var repeatButton = document.getElementById('repeatButton');
    var playhead = document.getElementById('playhead');
    var timeline = document.getElementById('timeline');
    var playheadNowPlaying = document.getElementById('playhead_now_playing');

    // Repeat button event
    $(document).on('click', '#repeatButton', function () {
        if (isRepeat) {
            isRepeat = false;
            repeatButton.className = "";
            repeatButton.className = "repeatDisable";
        } else {
            isRepeat = true;
            repeatButton.className = "";
            repeatButton.className = "repeatEnable";
        }
    });

    // Stop button event
    $(document).on('click', '#stopButton', function () {

    });

    // Stop button event
    $(document).on('click', '#previousButton', function () {
        if (currentIndex > 0) {
            currentIndex--;
        }
        music.src = listFile[currentIndex].url;
        play();
    });

    // Stop button event
    $(document).on('click', '#skipButton', function () {
        if (currentIndex < listFile.length - 1) {
            currentIndex++;
        }
        music.src = listFile[currentIndex].url;
        play();
    });

    // Stop button event
    $(document).on('click', '#volumeButton', function () {
        console.log('click');
    });

    // Song list item click
    $(document).on('click', '.songs', function () {
        var index = $(this).attr('id');
        currentIndex = index;
        console.log('document is always there' + $(this).attr('id'));
        music.src = listFile[index].url;
        play();
    });

    // timeline width adjusted for playhead
    var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

    // play button event listenter
    pButton.addEventListener("click", play);

    // timeupdate event listener
    music.addEventListener("timeupdate", timeUpdate, false);

    // makes timeline clickable
    timeline.addEventListener("click", function (event) {
        moveplayhead(event);
        music.currentTime = duration * clickPercent(event);
    }, false);

    // returns click as decimal (.77) of the total timelineWidth
    function clickPercent(event) {
        return (event.clientX - getPosition(timeline)) / timelineWidth;

    }

    // makes playhead draggable
    playhead.addEventListener('mousedown', mouseDown, false);
    playheadNowPlaying.addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

    // Boolean value so that audio position is updated only when the playhead is released
    var onplayhead = false;

    // mouseDown EventListener
    function mouseDown() {
        onplayhead = true;
        window.addEventListener('mousemove', moveplayhead, true);
        music.removeEventListener('timeupdate', timeUpdate, false);
    }

    // mouseUp EventListener
    // getting input from all mouse clicks
    function mouseUp(event) {
        if (onplayhead == true) {
            moveplayhead(event);
            window.removeEventListener('mousemove', moveplayhead, true);
            // change current time
            music.currentTime = duration * clickPercent(event);
            music.addEventListener('timeupdate', timeUpdate, false);
        }
        onplayhead = false;
    }
    // mousemove EventListener
    // Moves playhead as user drags
    function moveplayhead(event) {
        var newMargLeft = event.clientX - getPosition(timeline);

        if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
            playhead.style.marginLeft = newMargLeft + "px";
            playheadNowPlaying.style.marginLeft = newMargLeft + "px";
        }
        if (newMargLeft < 0) {
            playhead.style.marginLeft = "0px";
            playheadNowPlaying.style.marginLeft = "0px";
        }
        if (newMargLeft > timelineWidth) {
            playhead.style.marginLeft = timelineWidth + "px";
            playheadNowPlaying.style.marginLeft = timelineWidth + "px";
        }
    }

    // timeUpdate
    // Synchronizes playhead position with current point in audio
    function timeUpdate() {
        var playPercent = timelineWidth * (music.currentTime / duration);
        playhead.style.marginLeft = playPercent + "px";
        playheadNowPlaying.style.marginLeft = playPercent + "px";
        if (music.currentTime == duration) {
            pButton.className = "";
            pButton.className = "play";
        }
    }

    //Play and Pause
    function play() {
        // check unknow audio play
        if (currentIndex == -1) {
            currentIndex = 0;
            music.src = listFile[0].url;
        }
        // start music
        if (music.paused) {
            music.play();
            // remove play, add pause
            pButton.className = "";
            pButton.className = "pause";
        } else { // pause music
            music.pause();
            // remove pause, add play
            pButton.className = "";
            pButton.className = "play";
        }
    }

    // Gets audio file duration
    music.addEventListener("canplaythrough", function () {
        duration = music.duration;
    }, false);

    music.onended = function () {
        if (!isRepeat) {
            currentIndex++;
            music.src = listFile[currentIndex].url;
        }

        music.play();

        // remove play, add pause
        pButton.className = "";
        pButton.className = "pause";
    };
    // getPosition
    // Returns elements left position relative to top-left of viewport
    function getPosition(el) {
        return el.getBoundingClientRect().left;
    }

    /* DOMContentLoaded*/
});
