let jsonQuery = require("json-query")

let level = "N3";
let grammar, usage, example;

function getGrammarById(id) {
	let query = jsonQuery(`grammar[id=${id}]`, {
		data: data
	});
	return query.value;
}

function getGrammarByLevel(level) {
	let query = jsonQuery(`grammar[*level=${level}]`, {
		data: data
	});
	return query.value;
}

let speechRate = 1;
let speechRecognition = new window.webkitSpeechRecognition();
 
speechRecognition.continuous = false;
speechRecognition.lang = "ja-JP";

speechRecognition.onresult = function(event) {
	let current = event.resultIndex;
	let transcript = event.results[current][0].transcript;

	console.log(transcript);
	$("#speechToastBody").text("");
	for (let i = 0; i < transcript.length; i++) {
		if (example.sentence.includes(transcript[i])) {
			$("#speechToastBody").append(`<span class="text-success">${transcript[i]}</span>`);
		} else {
			$("#speechToastBody").append(`<span class="text-danger">${transcript[i]}</span>`);
		}
	}
	$("#speechResult").toast("show");
};

function speechSynthesis(sentence) {
	if (window.speechSynthesis.getVoices().length == 0) {
		window.speechSynthesis.addEventListener("voiceschanged", function() {
			textToSpeech(sentence);
		});
	} else {
		textToSpeech(sentence);
	}

	function textToSpeech(sentence) {
		let available_voices = window.speechSynthesis.getVoices();
		let voice = "";

		for (let i = 0; i < available_voices.length; i++) {
			if (available_voices[i].lang === "ja-JP") {
				voice = available_voices[i];
				break;
			}
		}
		if (voice === "")
			voice = available_voices[0];

		let utter = new SpeechSynthesisUtterance();
		utter.rate = speechRate;
		utter.pitch = 0.5;
		utter.text = sentence;
		utter.voice = voice;

		window.speechSynthesis.speak(utter);
	}
}

function addGrammarHTML(id, grammar) {
	$(`#${id}`).html("");
	for (let i = 0; i < grammar.usage.length; i++) {
		let usage = grammar.usage[i];
		$(`#${id}`).append(`<div class="text-center mb-3"><button class="btn btn-secondary">${usage.structure}</button></div>`);
		$(`#${id}`).append(`<p class="text-warning">句型：${usage.structure}</p>`);
		$(`#${id}`).append(`<p class="text-warning">${usage.explanation}</p>`);

		$(`#${id}`).append(`<ol id="${i}">`);
		for (let j = 0; j < usage.example.length; j++) {
			let example = usage.example[j];
			$(`#${i}`).append(`<li>${example.sentence}【${example.translation}】<a href="#"><i class="fas fa-volume-up" id="${i}-${j}"></i></a></li>`);
			$(`#${i}-${j}`).click(function() {
				speechSynthesis(example.sentence);
			})
		}

		if (typeof(usage.note) !== "undefined") {
		    for (let j = 0; j < usage.note.length; j++) {
				$(`#${id}`).append(`<p class="text-danger">${usage.note[j]}</p>`);
			}
		}	    
	}
	if (typeof(grammar.note) !== "undefined") {
		$(`#${id}`).append(`<div class="text-center mb-3"><button class="btn btn-secondary">補充</button></div>`);
	    for (let j = 0; j < grammar.note.length; j++) {
			$(`#${id}`).append(`<p">${grammar.note[j]}</p>`);
		}
	}
}

function addGrammarListHTML(id, list) {
	$(`#${id}`).html("");
	for (let i = 0; i < list.length; i++) {
		$(`#${id}`).append(`<p><a class="list-item" href="#" id="${list[i].id}">${list[i].level}文法${(i+1).toString().padStart(2, "0")} 「${list[i].name}」${list[i].translation}</a></p>`);
	}

	$(".list-item").click(function(event) {
		let grammar = getGrammarById(event.target.id);
		$("#grammarModalLabel").text(`「${grammar.name}」${grammar.translation}`);
		addGrammarHTML("grammarModalBody", grammar);
		$("#grammarModal").modal("show");
	})
}

function choose(choices) {
	let index = Math.floor(Math.random() * choices.length);
	return choices[index];
}

function chooseGrammar(level) {
	let newGrammar = choose(getGrammarByLevel(level));
	while (newGrammar == grammar) {
		newGrammar = choose(getGrammarByLevel(level));
	}
	grammar = newGrammar;
	usage = choose(grammar.usage);
	example = choose(usage.example);

	$("#name").text(grammar.name);
	$("#sentence").text(example.sentence);
}

$(function() {
    chooseGrammar(level);
});

$("#learnButton").click(function() {
	$("#grammarModalLabel").text(`「${grammar.name}」${grammar.translation}`);
	addGrammarHTML("grammarModalBody", grammar);
	$("#grammarModal").modal("show");
})

$("#nextButton").click(function() {
	chooseGrammar(level);
})

$("#listen").click(function() {
	$("#speechSynthesis").toast("show");
	speechSynthesis(example.sentence);
})

$("#speak").click(function() {
	$("#speechRecognition").toast("show");
	speechRecognition.start();
})

$("#list").click(function() {
	let list = getGrammarByLevel(level);
	$("#grammarListModalLabel").text("Grammar List: JLPT " + level);
	addGrammarListHTML("grammarListModalBody", list);
	$("#grammarListModal").modal("show");
})

$(".dropdown-item").click(function(event) {
	let id = event.target.id;

	if (id == "slow") {
		speechRate = 0.5;
		$("#dropdownSpeech").text("Speech: Slow");
	} else if (id == "normal") {
		speechRate = 1;
		$("#dropdownSpeech").text("Speech: Normal");
	} else if (id == "N3") {
		level = "N3";
		$("#dropdownLevel").text("Level: N3");
	} else if (id == "N4") {
		level = "N4";
		$("#dropdownLevel").text("Level: N4");
	}
})