;(function () {
	var fa = document.createElement("style")
	fa.type = "text/css"
	fa.textContent =
		'@font-face { font-family: Roboto; src: url("' +
		chrome.extension.getURL("css/Roboto-Regular.ttf") +
		'"); }'
	document.head.appendChild(fa)

	$(document).on("keydown", function (e) {
		if (e.keyCode === 27 && $(".black-box-search-page-holder")) {
			closeSearch()
		}
	})

	var savedTerm = ""
})()

function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) {
	// the highlightStartTag and highlightEndTag parameters are optional
	if (!highlightStartTag || !highlightEndTag) {
		highlightStartTag =
			"<font style='color:blue; background-color:yellow;' class='black-box-found-text'>"
		highlightEndTag = "</font>"
	}

	var newText = ""
	var i = -1
	var lcSearchTerm = searchTerm.toLowerCase()
	var lcBodyText = bodyText.toLowerCase()

	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i + 1)
		if (i < 0) {
			newText += bodyText
			bodyText = ""
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block
				if (
					lcBodyText.lastIndexOf("/script>", i) >=
					lcBodyText.lastIndexOf("<script", i)
				) {
					newText +=
						bodyText.substring(0, i) +
						highlightStartTag +
						bodyText.substr(i, searchTerm.length) +
						highlightEndTag
					bodyText = bodyText.substr(i + searchTerm.length)
					lcBodyText = bodyText.toLowerCase()
					i = -1
				}
			}
		}
	}

	return newText
}
/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
function highlightSearchTerms(
	searchText,
	treatAsPhrase,
	warnOnFailure,
	highlightStartTag,
	highlightEndTag
) {
	// if the treatAsPhrase parameter is true, then we should search for
	// the entire phrase that was entered; otherwise, we will split the
	// search string so that each word is searched for and highlighted
	// individually
	if (treatAsPhrase) {
		searchArray = [searchText]
	} else {
		searchArray = searchText.split(" ")
	}

	if (!document.body || typeof document.body.innerHTML == "undefined") {
		if (warnOnFailure) {
			alert(
				"Sorry, for some reason the text of this page is unavailable. Searching will not work."
			)
		}
		return false
	}

	var bodyText = document.body.innerHTML
	for (var i = 0; i < searchArray.length; i++) {
		bodyText = doHighlight(
			bodyText,
			searchArray[i],
			highlightStartTag,
			highlightEndTag
		)
	}

	document.body.innerHTML = bodyText

	//scroll to selected text
	$(".black-box-found-text").get(0).scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "center"
	})
	return true
}

chrome.runtime.onMessage.addListener((req, sender, res) => {
	if (req.message === "search") {
		openSearch(req)
	} else if (req.message === "show-search-results") {
		// closeSearch()
		$(".black-box-search-page-holder .search-middle .title").text("Results")
		$(
			".black-box-search-page-holder .search-middle .search-result-items"
		).empty()
		$(".black-box-search-page-holder .search-top .black-box-loader").css(
			"visibility",
			"hidden"
		)
		if (req.filter !== "videos") {
			$(".black-box-search-page-holder .filter").removeClass("active")
			$(".black-box-search-page-holder .filter.all").addClass("active")
		}
		$(".black-box-search-page-holder .search-middle").removeClass("hide")
		$(".black-box-search-page-holder .filter-options").removeClass("hide")

		var data = req.data.split(";")
		// highlightSearchTerms(data)
		data.forEach((result) => {
			// highlightSearchTerms(result)
			if (result.length != 0) {
				var $el
				$el = $(`
					<a target="_blank" class="search-item">
						<div class="search-title">${result}</div>
					</a>
				`)
				$(
					".black-box-search-page-holder .search-middle .search-result-items"
				).append($el)
			}
		})
	}

	return true
})

function closeSearch() {
	$(".black-box-search-page-holder").off()
	$(".black-box-search-page-holder").remove()
}

function openSearch(req) {
	if ($(`.black-box-search-page-holder`).length === 0) {
		var $search = $(`
			<div class="search-holder black-box-search-page-holder">
				<div class="search-container">
					<div class="search-bar">
						<div class="search-top">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width="14"
								height="14"
								viewBox="0 0 172 172"
								style="fill: #000000"
								class="search-icon"
							>
								<g
									fill="none"
									fill-rule="nonzero"
									stroke="none"
									stroke-width="1"
									stroke-linecap="butt"
									stroke-linejoin="miter"
									stroke-miterlimit="10"
									stroke-dasharray=""
									stroke-dashoffset="0"
									font-family="none"
									font-weight="none"
									font-size="none"
									text-anchor="none"
									style="mix-blend-mode: normal"
								>
									<path
										d="M0,172v-172h172v172z"
										fill="none"
									></path>
									<g fill="#c1c9d2">
										<path
											d="M72.24,10.32c-32.26344,0 -58.48,26.21656 -58.48,58.48c0,32.26344 26.21656,58.48 58.48,58.48c12.76563,0 24.56375,-4.11187 34.185,-11.0725l45.2575,45.15l9.675,-9.675l-44.72,-44.8275c8.78813,-10.23937 14.0825,-23.52906 14.0825,-38.055c0,-32.26344 -26.21656,-58.48 -58.48,-58.48zM72.24,17.2c28.54125,0 51.6,23.05875 51.6,51.6c0,28.54125 -23.05875,51.6 -51.6,51.6c-28.54125,0 -51.6,-23.05875 -51.6,-51.6c0,-28.54125 23.05875,-51.6 51.6,-51.6z"
										></path>
									</g>
								</g>
							</svg>
							<input
								type="text"
								class="search-input"
								placeholder="Go to"
							/>
							<img class="black-box-loader" src="${chrome.extension.getURL(
								"images/loader.svg"
							)}" alt="loader">
						</div>
						<div class="search-middle">
							<div class="title-strip-holder">
								<div class="title">Recently viewed</div>
								<div class="filter-options hide">
								</div>
							</div>
							
							<div class="search-result-items"></div>
						</div>
						<div class="search-bottom">
							<div class="search-text">
								Press <span class="command">CMD-J</span>or<span class="command">Alt-O</span> to
								use the BLACKBOX deep search.
							</div>
							
						</div>
					</div>
				</div>
			</div>
		`)

		$(`body`).prepend($search)
		$(".black-box-search-page-holder .search-input").focus()
		if (req.data !== undefined) {
			$(".black-box-search-page-holder .search-input").val(req.data)
			searchQuery(req.data)
			savedTerm = req.data
		}

		$(".black-box-search-page-holder").on("click", function (e) {
			if ($(e.target).hasClass("black-box-search-page-holder")) {
				closeSearch()
			}
		})
		$(".black-box-search-page-holder .filter").on("click", function () {
			$(".black-box-search-page-holder .filter").removeClass("active")
			$(this).addClass("active")
			if ($(this).hasClass("videos")) {
				searchQuery(`${savedTerm}`, "videos")
			} else {
				searchQuery(savedTerm)
			}
		})
		$(document).on(
			"click",
			".black-box-search-page-holder .search-item",
			function () {
				$(".black-box-found-text").contents().unwrap()
				const text = $(this).find(".search-title").text().trim()
				closeSearch()
				highlightSearchTerms(text, true)
			}
		)
		chrome.storage.local.get(["searched"], function (items) {
			if (items.searched !== undefined) {
				var arr = items.searched
				arr.forEach((el) => {
					$(
						".black-box-search-page-holder .search-middle .search-result-items"
					).append($.parseHTML(el))
				})
			} else {
				$(".black-box-search-page-holder .search-middle").addClass(
					"hide"
				)
			}
		})
		$(".black-box-search-page-holder .search-input").on(
			"keydown",
			function (e) {
				const query = $(this).val()
				if (e.keyCode === 13 && query !== "") {
					searchQuery(query)
					savedTerm = query
				}
			}
		)
	} else {
		closeSearch()
	}
}

function searchQuery(query, from = "") {
	$(".black-box-search-page-holder .search-top .black-box-loader").css(
		"visibility",
		"visible"
	)
	if (!query) {
		query = savedTerm
	}
	var text = htmlText(document.body.innerHTML)
	chrome.runtime.sendMessage({
		message: "search-web",
		data: query,
		filter: from,
		fullText: text
	})
}

function htmlText(html) {
	html = html.replace(/<style([\s\S]*?)<\/style>/gi, "")
	html = html.replace(/<script([\s\S]*?)<\/script>/gi, "")
	html = html.replace(/<\/div>/gi, "\n")
	html = html.replace(/<\/li>/gi, "\n")
	html = html.replace(/<li>/gi, "  *  ")
	html = html.replace(/<\/ul>/gi, "\n")
	html = html.replace(/<\/p>/gi, "\n")
	html = html.replace(/<br\s*[\/]?>/gi, "\n")
	html = html.replace(/<[^>]+>/gi, "")
	html = html.split("\n").join(" ")
	html = html.split("\t").join(" ")
	return html
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "return") {
		removeLoader()
		window.postMessage({
			source: "return",
			payload: { data: request.value }
		})
	} else if (request.message === "returnSuggestion") {
		removeLoader()
		window.postMessage({
			source: "suggestReturn",
			payload: { data: request.value }
		})
	} else if (request.message === "setSuggestionStatus") {
		setSuggestionStatus(request.data)
	}
})

window.addEventListener("message", (event) => {
	if (event.source !== window) return
	if (event.data.source == "getQuery") {
		addLoader()
		chrome.runtime.sendMessage(event.data)
	}
	if (event.data.source == "getSuggestion") {
		addLoader()
		chrome.runtime.sendMessage(event.data)
	}
	if (event.data.source == "updateSuggestionStatus") {
		suggestionDisplayed = event.data.status
		currentSuggestion = event.data.suggestion
	}
})

function addLoader() {
	const url = window.location.href
	var $loader = null
	var $holder = null
	if (url.includes("jupyter")) {
		$holder = $("#jp-main-statusbar").children(":first")
		$loader = $(`
			<div class="f1235lqo blackbox-loading">
				Blackbox Loading...
			</div>
		`)
	} else if (url.includes("console.paperspace.com")) {
		$holder = $(".c-iHjWNZ").children(":first")
		$loader = $(`
			<span class="c-clESfx c-clESfx-cEvULg-variant-secondary c-hNNYhi blackbox-loading">Blackbox Loading...</span>
		`)
	}

	if ($holder) {
		$holder.append($loader)
	}
}
function removeLoader() {
	$(".blackbox-loading").remove()
}

function setSuggestionStatus(status) {
	if (currentPageType === "notebook") {
		if (status) {
			$(".blackbox-select").val("enable")
		} else {
			$(".blackbox-select").val("disable")
		}
	} else if (currentPageType === "lab") {
		const $el = $(".blackbox-track")
		$el.parent().attr("aria-checked", `${status}`)
	}

	window.postMessage({
		source: "suggestionsStatus",
		payload: { enabled: status }
	})
}

var currentPageType = ""
function addEnabler() {
	if (window.location.href.includes("jupyter")) {
		const statusBarCheck = setInterval(() => {
			const $body = $("body")
			if ($body.attr("data-retro") === "notebooks") {
				if ($(".jp-NotebookPanel-toolbar").length) {
					clearInterval(statusBarCheck)
					currentPageType = "notebook"
					chrome.storage.sync.get(async function (items) {
						const enabled = items.suggestionsEnabled
						const $holder = $(".jp-NotebookPanel-toolbar")
						const $el = $(`
							<div class="lm-Widget jp-Toolbar-item blackbox-select-enabler">
								<div class="jp-HTMLSelect jp-DefaultStyle jp-Notebook-toolbarCellTypeDropdown">
									<select aria-label="Cell type" class="blackbox-select">
										<option value="disable" ${enabled ? "" : "selected"}>Blackbox disabled</option>
										<option value="enable"  ${enabled ? "selected" : ""}>Blackbox enabled</option>
									</select>
									<span class="f1ozlkqi">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 18 18" data-icon="ui-components:caret-down-empty">
											<g xmlns="http://www.w3.org/2000/svg" class="jp-icon3" fill="#616161" shape-rendering="geometricPrecision">
												<path d="M5.2,5.9L9,9.7l3.8-3.8l1.2,1.2l-4.9,5l-4.9-5L5.2,5.9z"></path>
											</g>
										</svg>
									</span>
								</div>
							</div>
						`)
						$holder.find(".jp-Notebook-toolbarCellType").after($el)

						$(document).on(
							"change",
							".blackbox-select",
							function (e) {
								const status = this.value

								if (status === "disable") {
									$(this).val("enable")
									chrome.runtime.sendMessage({
										message: "disableSuggestions"
									})
								} else if (status === "enable") {
									$(this).val("disable")
									chrome.runtime.sendMessage({
										message: "enableSuggestions"
									})
								}
							}
						)

						window.postMessage({
							source: "suggestionsStatus",
							payload: { enabled }
						})
					})
				}
			} else {
				if ($("#jp-main-statusbar").children(":first").length) {
					clearInterval(statusBarCheck)
					currentPageType = "lab"
					const $holder = $("#jp-main-statusbar").children(":first")
					chrome.storage.sync.get(async function (items) {
						const enabled = items.suggestionsEnabled

						const $el = $(`
							<div class="lm-Widget p-Widget fk1s8g9 blackbox-enabler">
								<button
									class="jp-switch"
									role="switch"
									aria-checked='${enabled ? enabled : false}'
									title="Simple Interface (Ctrl+Shift+D)">
									<label class="jp-switch-label" title="Simple Interface (Ctrl+Shift+D)">
										Blackbox
									</label>
									<div class="jp-switch-track blackbox-track" aria-hidden="true"></div>
								</button>
							</div>
						`)
						$holder.append($el)

						$(document).on(
							"click",
							".blackbox-enabler",
							function () {
								const $el = $(".blackbox-track")
								const currActive =
									$el.parent().attr("aria-checked") == "true"
										? true
										: false
								if (currActive) {
									chrome.runtime.sendMessage({
										message: "disableSuggestions"
									})
								} else {
									chrome.runtime.sendMessage({
										message: "enableSuggestions"
									})
								}
							}
						)

						window.postMessage({
							source: "suggestionsStatus",
							payload: { enabled }
						})
					})
				}
			}
		}, 1000)
	}
}

addEnabler()
$(document).on("keyup", function (e) {
	const key = e.key

	if (key === "Tab" && suggestionDisplayed) {
		window.postMessage({
			source: "acceptSuggestion",
			suggestion: currentSuggestion
		})
	}
})

var suggestionDisplayed = false
var currentSuggestion = ""
var actualCode = `
		function returnCommentSymbol(language = "javascript") {
			const languageObject = {
				bat: "@REM",
				c: "//",
				csharp: "//",
				cpp: "//",
				closure: ";;",
				coffeescript: "#",
				dockercompose: "#",
				css: "/*DELIMITER*/",
				"cuda-cpp": "//",
				dart: "//",
				diff: "#",
				dockerfile: "#",
				fsharp: "//",
				"git-commit": "//",
				"git-rebase": "#",
				go: "//",
				groovy: "//",
				handlebars: "{{!--DELIMITER--}}",
				hlsl: "//",
				html: "<!--DELIMITER-->",
				ignore: "#",
				ini: ";",
				java: "//",
				javascript: "//",
				javascriptreact: "//",
				json: "//",
				jsonc: "//",
				julia: "#",
				latex: "%",
				less: "//",
				lua: "--",
				makefile: "#",
				markdown: "<!--DELIMITER-->",
				"objective-c": "//",
				"objective-cpp": "//",
				perl: "#",
				perl6: "#",
				php: "<!--DELIMITER-->",
				powershell: "#",
				properties: ";",
				jade: "//-",
				python: "#",
				r: "#",
				razor: "<!--DELIMITER-->",
				restructuredtext: "..",
				ruby: "#",
				rust: "//",
				scss: "//",
				shaderlab: "//",
				shellscript: "#",
				sql: "--",
				svg: "<!--DELIMITER-->",
				swift: "//",
				tex: "%",
				typescript: "//",
				typescriptreact: "//",
				vb: "'",
				xml: "<!--DELIMITER-->",
				xsl: "<!--DELIMITER-->",
				yaml: "#"
			}
			return languageObject[language].split("DELIMITER")
		}
		var savedChPos = 0
		var returnedSuggestion = ''
		let editor, doc, cursor, line, pos
		pos = {line: 0, ch: 0}
		var suggestionsStatus = false
		var docLang = "python"
		var suggestionDisplayed = false
		var isReturningSuggestion = false
		document.addEventListener("keydown", (event) => {
		setTimeout(()=>{
			editor = event.target.closest('.CodeMirror');
			if (editor){
				const codeEditor = editor.CodeMirror
				if(!editor.classList.contains("added-tab-function")){
					editor.classList.add("added-tab-function")
					codeEditor.removeKeyMap("Tab")
					codeEditor.setOption("extraKeys", {Tab: (cm)=>{

						if(returnedSuggestion){
							acceptTab(returnedSuggestion)
						}
						else{
							cm.execCommand("defaultTab")
						}
					}})
				}
				doc = editor.CodeMirror.getDoc()
				cursor = doc.getCursor()
				line = doc.getLine(cursor.line)
				pos = {line: cursor.line, ch: line.length}

				if(cursor.ch > 0){
					savedChPos = cursor.ch
				}

				const fileLang = doc.getMode().name
				docLang = fileLang
				const commentSymbol = returnCommentSymbol(fileLang)
				if (event.key == "?"){
					var lastLine = line
					lastLine = lastLine.slice(0, savedChPos - 1)

					if(lastLine.trim().startsWith(commentSymbol[0])){
						lastLine += " "+fileLang
						lastLine = lastLine.split(commentSymbol[0])[1]
						window.postMessage({source: 'getQuery', payload: { data: lastLine } } )
						isReturningSuggestion = true
						displayGrey("\\nBlackbox loading...")
					}
				}else if(event.key === "Enter" && suggestionsStatus && !isReturningSuggestion){
					var query = doc.getRange({ line: Math.max(0,cursor.line-10), ch: 0 }, { line: cursor.line, ch: line.length })
					window.postMessage({source: 'getSuggestion', payload: { data: query, language: docLang } } )
					displayGrey("Blackbox loading...")
				}else if(event.key === "ArrowRight" && returnedSuggestion){
					acceptTab(returnedSuggestion)
				}else if(event.key === "Enter" && isReturningSuggestion){
					displayGrey("\\nBlackbox loading...")
				}else if(event.key === "Escape"){
					displayGrey("")
				}
			}
		}, 0)
		})

		function acceptTab(text){
		if (suggestionDisplayed){
			displayGrey("")
			doc.replaceRange(text, pos)
			returnedSuggestion = ""
			updateSuggestionStatus(false)
		}
		}
		function acceptSuggestion(text){
			displayGrey("")
			doc.replaceRange(text, pos)
			returnedSuggestion = ""
			updateSuggestionStatus(false)
		}
		function displayGrey(text){
			if(!text){
				document.querySelector(".blackbox-suggestion").remove()
				return
			}
			var el = document.querySelector(".blackbox-suggestion")
			if(!el){
				el = document.createElement('span')
				el.classList.add("blackbox-suggestion")
				el.style = 'color:grey'
				el.innerText = text
			}
			else{
				el.innerText = text
			}
			
			var lineIndex = pos.line;
			editor.getElementsByClassName('CodeMirror-line')[lineIndex].appendChild(el)
		}
		function updateSuggestionStatus(s){
			suggestionDisplayed = s
			window.postMessage({source: 'updateSuggestionStatus', status: suggestionDisplayed, suggestion: returnedSuggestion})
		}
		window.addEventListener('message', (event)=>{
		if (event.source !== window ) return
		if (event.data.source == 'return'){
			isReturningSuggestion = false
			const formattedCode = formatCode(event.data.payload.data)
			returnedSuggestion = formattedCode
			displayGrey(formattedCode)
			updateSuggestionStatus(true)
		}
		if(event.data.source == 'suggestReturn'){
			returnedSuggestion = event.data.payload.data
			displayGrey(event.data.payload.data)
			updateSuggestionStatus(true)
		}
		if(event.data.source == 'suggestionsStatus'){
			suggestionsStatus = event.data.payload.enabled
		}
		if(event.data.source == 'acceptSuggestion'){
			
			acceptSuggestion(event.data.suggestion)
		}
		})
		document.addEventListener("keyup", function(){
			returnedSuggestion = ""
			updateSuggestionStatus(false)
		})
		function formatCode(data) {
			if (Array.isArray(data)) {
				var finalCode = ""
				var pairs = []
		
				const commentSymbol = returnCommentSymbol(docLang)
				data.forEach((codeArr, idx) => {
					const code = codeArr[0]
					var desc = codeArr[1]
					const descArr = desc.split("\\n")
					var finalDesc = ""
					descArr.forEach((descLine, idx) => {
						const whiteSpace = descLine.search(/\\S/)
						if (commentSymbol.length < 2 || idx === 0) {
							finalDesc += insert(descLine, whiteSpace, commentSymbol[0])
						}
						if (commentSymbol.length > 1 && idx === descArr.length - 1) {
							finalDesc = finalDesc + commentSymbol[1] + "\\n"
						}
					})
		
					finalCode += finalDesc + "\\n\\n" + code
					pairs.push(finalCode)
				})
				return "\\n"+pairs.join("\\n")
			}
		
			return "\\n"+data
		}
		
		function insert(str, index, value) {
			return str.substr(0, index) + value + str.substr(index)
		}
	`
var script = document.createElement("script")
script.textContent = actualCode
document.body.append(script)
