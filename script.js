(function(){

var audioPlayer;

$('#attach').change(function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
            $('#audio').remove();
             $('#player-hook').append('<audio id="audio" src="' + evt.target.result + '"></audio>');
             document.getElementById('audio').addEventListener('loadedmetadata', function(){
                 console.log('Loading complete.')    
                 initAudioJS();
                 adjustPlayerWidth();
                 toggleControls();        
             });
        }
    };
    reader.onloadstart = function(evt) {
        console.log('loading file '+file.name+'...');
        localStorage.setItem("lastfile", file.name);
    };
    reader.readAsDataURL(file);
});

function adjustPlayerWidth(){
    var cntrls = $('.controls');
   var gap = $(window).width() - (cntrls.offset().left + cntrls.width());
    $('.scrubber').width( $('.scrubber').width()+gap );
   console.log(gap);
}


// autosave every second
var field = document.getElementById("textbox");
if ( localStorage.getItem("autosave")) {
   field.value = localStorage.getItem("autosave");
}
setInterval(function(){
   localStorage.setItem("autosave", field.value);
}, 1000);

// load existing file name
if ( localStorage.getItem("lastfile") ) {
   document.getElementById("lastfile").innerHTML = "Last file: "+localStorage.getItem("lastfile");
}


// play/pause
var playing = false;
function playPause(){
    if (playing == true){
        document.getElementById('audio').pause();
        $('.audiojs').removeClass('playing');
    } else {
        document.getElementById('audio').play();
        $('.audiojs').addClass('playing');
    };
    playing = !playing;
};

// get timestamp
var timestamp;
function getTimestamp(){
    // get timestap
    var time = document.getElementById('audio').currentTime  
    var minutes = Math.floor(time / 60);
    var seconds = ("0" + Math.round( time - minutes * 60 ) ).slice(-2);
    return minutes+":"+seconds;
};

function insertTimestamp(){
    insertAtCaret('textbox',"["+getTimestamp()+"]" );
}

// skip forward
function skip(direction){
    var audio = document.getElementById('audio');
    if (direction == "forwards"){
        audio.currentTime = audio.currentTime+1.5;
    } else if (direction == "backwards") {
        audio.currentTime = audio.currentTime-1.5;
    }
}

// speed
function speed(newSpeed){
    var newSpeedNumber;
    var currentSpeed = document.getElementById('audio').playbackRate;
    if (newSpeed == "up"){
        newSpeedNumber = currentSpeed+0.1;
    } else if (newSpeed == "down"){
        newSpeedNumber = currentSpeed-0.1;
    } else if (newSpeed == "reset"){
        newSpeedNumber = 1;
    };
    document.getElementById('audio').playbackRate = newSpeedNumber;
}



// keyboard shortcuts
Mousetrap.bind('escape', function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        // internet explorer
        e.returnValue = false;
    }
    playPause();
    return false;
});
Mousetrap.bind('f1', function(e) {
    skip('backwards');
    return false;
});
Mousetrap.bind('f2', function(e) {
    skip('forwards');
    return false;
});
Mousetrap.bind('f3', function(e) {
    speed('down');
    return false;
});
Mousetrap.bind('f4', function(e) {
    speed('up');
    return false;
});
Mousetrap.bind('mod+i', function(e) {
    insertTimestamp();
    return false;
});
Mousetrap.bind('mod+s', function(e) {
    alert("No need to manually save - your transcript is automatically backed up continuously.")
    return false;
});

$('.play-pause').click(function(){
    playPause();    
});

$('.skip-backwards').click(function(){
    skip('backwards');    
});
$('.skip-forwards').click(function(){
    skip('forwards');    
});
$('.speed-down').click(function(){
    speed('down');    
});
$('speed-up').click(function(){
    speed('up');    
});
$('.speed-reset').click(function(){
    speed('reset');    
});
    
// insert text at cursor
function insertAtCaret(areaId,text) {
	var txtarea = document.getElementById(areaId);
	var scrollPos = txtarea.scrollTop;
	var strPos = 0;
	var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
		"ff" : (document.selection ? "ie" : false ) );
	if (br == "ie") { 
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart ('character', -txtarea.value.length);
		strPos = range.text.length;
	}
	else if (br == "ff") strPos = txtarea.selectionStart;
	
	var front = (txtarea.value).substring(0,strPos);  
	var back = (txtarea.value).substring(strPos,txtarea.value.length); 
	txtarea.value=front+text+back;
	strPos = strPos + text.length;
	if (br == "ie") { 
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart ('character', -txtarea.value.length);
		range.moveStart ('character', strPos);
		range.moveEnd ('character', 0);
		range.select();
	}
	else if (br == "ff") {
		txtarea.selectionStart = strPos;
		txtarea.selectionEnd = strPos;
		txtarea.focus();
	}
	txtarea.scrollTop = scrollPos;
}

function detectFormats(format){
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/'+format+';').replace(/no/, ''));
}

function listSupportedFormats(){
    var supportedFormats = [];
    var formats = ['mp3', 'ogg', 'webm', 'wav'];
    var i = 0;
    formats.forEach(function(format, index) {
        if (detectFormats(format) == true){
            supportedFormats[i] = format;
            i++;
        }
    });
    return supportedFormats.join(', ');
}
document.getElementById("formats").innerHTML = "Your browser supports the following formats: "+listSupportedFormats()+". You may need to <a href='http://media.io'>convert your file</a>.";

function initAudioJS(){
    audiojs.events.ready(function() {
      audiojs.createAll();
    });
}


var controls = false;
function toggleControls(){
    if (controls == false){
        $('.input').hide();
        $('.controls').show();
    } else {
        $('.controls').hide();
        $('.input').show();
    };
    controls = !controls;
};


console.log( detectFormats() );


})(); // end script