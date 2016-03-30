var member_of = []
var in_gallery

function init() {
	$(".folder-div").remove()
	member_of = []
	var htmlURL = chrome.extension.getURL("dropdown.html");
	$.get(htmlURL, function (data) {
		$("#right-content").append(data)
		$("#right-content .new-panel #folders").after('<p id="status"></p>')
		chrome.storage.sync.get(null, function (data){
			var curr_url = window.location.href
			var url
			if(in_gallery)
				url = "/account/favorites/"+curr_url.slice(25)
			else
				url = curr_url.slice(16)
			for(var key in data) {
				if(data.hasOwnProperty(key)) {
					$("#folders").prepend('<option value="'+key+'">'+key+'</option>')
					var items = data[key]
					for(var i=0; i<items.length; i++) {
						console.log(items[i])
						if(items[i]['url'] === url){
							member_of.push(key)
							break;
						}
					}
					currently_in()
				}
			}
		})
		if(in_gallery == true && !$(".favorite-image").hasClass("favorited"))
			$(".folder-div").hide()
	})
}

function currently_in() {
	var membership = $('#member')
	membership.text('This image is currently in:')
	membership.append("<br/>")
	for(var i=0; i<member_of.length; i++) {
		membership.append(document.createTextNode(member_of[i]));
		membership.append("<br/>")
	}
}

$(document).ready(function() {
	var curr_url = window.location.href
	if(curr_url.includes("gallery"))
		in_gallery = true
	else
		in_gallery = false
	init()
	$(".next-prev").click(function() {
		init()
	})
	$(".nav-image").click(function() {
		init()
	})
	$(document).keydown(function(e) {
	    if(e.which == 37 || e.which == 39) {
			init()
	    }
	});
	$(".favorite-image").click(function() {
		$(".folder-div").toggle()
	})
})


$("#right-content").on("click", "#add-img", function (e) {
	e.preventDefault();
	var curr_url = window.location.href
	console.log($("a.selected").css("background-image").slice(5, -2))
	var thumb_url = $("a.selected").css("background-image").slice(5, -2)
	var title = $(".post-title").text()

	if(!thumb_url){
		$("#status").text("Not added. Thumbnail url not available.")
		return
	}

	var folder_name = $("#folders").val()
	if(folder_name == ''){
		$("#status").text("Please choose a folder.")
		return
	}

	chrome.storage.sync.get(folder_name, function (data){
		var obj = {}
		var url
		if(in_gallery)
			url = "/account/favorites/"+curr_url.slice(25)
		else
			url = curr_url.slice(16)
		if(jQuery.isEmptyObject(data)){
			obj[folder_name] = [{'url': url, 'thumb': thumb_url, 'title': title}]
			chrome.storage.sync.set(obj, function() {
				member_of.push(folder_name);
				currently_in()
				$("#status").text(url+" added to "+folder_name)
			})
		}
		else{
			data[folder_name].push({'url': url, 'thumb': thumb_url, 'title': title})
			obj[folder_name] = data[folder_name]
			chrome.storage.sync.set(obj, function() {
				member_of.push(folder_name);
				currently_in()
				$("#status").text(url+" added to "+folder_name)
			})
		}
	})
})

$("#right-content").on("click", "#rem-img", function (e) {
	e.preventDefault;
	var curr_url = window.location.href
	var url
	if(in_gallery)
		url = "/account/favorites/"+curr_url.slice(25)
	else
		url = curr_url.slice(16)
	var folder_name = $("#folders").val()
	if(folder_name == ''){
		$("#status").text("Please choose a folder.")
		return
	}
	chrome.storage.sync.get(folder_name, function (data){
		var items = data[folder_name]
		var removed = false
		for(var i=0; i<items.length; i++) {
			if(items[i]['url'] === url) {
				items.splice(i, 1)
				removed = true
			}
		}
		if(removed) {
			var obj = {}
			obj[folder_name] = items
			chrome.storage.sync.set(obj, function() {
				for(var i=0; i<member_of.length; i++) {
					if (member_of[i] == folder_name)
						member_of.splice(i, 1)
				}
				currently_in()
				$("#status").text("image removed from "+folder_name)
			})
		}
		else {
			$("#status").text("image not in "+folder_name)
		}
	})
})

$("#right-content").on("click", "#add-fol", function (e) {
	e.preventDefault;
	var new_folder_name = window.prompt("Enter a new folder name", "New folder")
	if(new_folder_name == ''){
		$("#status").text("Please enter a folder name")
		return
	}
	var name_exists = false
	chrome.storage.sync.get(null, function (data){
		for(var key in data) {
			if(data.hasOwnProperty(key)) {
				if(key == new_folder_name){
					$("#status").text("folder '"+new_folder_name+"' already exists")
					name_exists = true
				}
			}
		}
		if(name_exists == false) {
			var obj = {}
			obj[new_folder_name] = []
			chrome.storage.sync.set(obj, function() {
				$("#status").text("folder '"+new_folder_name+"' added")
				$("#folders").prepend('<option value="'+new_folder_name+'">'+new_folder_name+'</option>')
			})
		}
	})
})

$("#right-content").on("click", "#del-fol", function (e) {
	e.preventDefault;
	var folder_name = $("#folders").val()
	if(folder_name == ''){
		$("#status").text("Please choose a folder.")
		return
	}
	chrome.storage.sync.remove(folder_name, function() {
		$("#folders option[value='"+folder_name+"']").remove()
		for(var i=0; i<member_of.length; i++) {
			if (member_of[i] == folder_name)
				member_of.splice(i, 1)
		}
		currently_in()
		$("#status").text(folder_name+" deleted")
	})
})

$("#right-content").on("click", "#rename", function (e) {
	e.preventDefault;
	var folder_name = $("#folders").val()
	if(folder_name == ''){
		$("#status").text("Please choose a folder.")
		return
	}
	var new_folder_name = window.prompt("Enter a new folder name", "New name")
	var name_exists = false
	chrome.storage.sync.get(null, function (data){
		for(var key in data) {
			if(data.hasOwnProperty(key)) {
				if(key == new_folder_name){
					$("#status").text("folder '"+new_folder_name+"' already exists")
					name_exists = true
				}
			}
		}
		if(name_exists == false) {
			chrome.storage.sync.get(folder_name, function (data){
				var items = data[folder_name]
				var obj = {}
				obj[new_folder_name] = items
				chrome.storage.sync.set(obj, function() {
					chrome.storage.sync.remove(folder_name, function() {
						$("#folders option[value='"+folder_name+"']").text(new_folder_name)
						$("#folders option[value='"+folder_name+"']").attr("value", new_folder_name)
						for(var i=0; i<member_of.length; i++) {
							if (member_of[i] == folder_name)
								member_of[i] = new_folder_name
						}
						currently_in()
						$("#status").text("folder name changed to "+new_folder_name)
					})
				})
			})
		}
	})
})

$("#right-content").on("click", "#clear", function (e) {
	e.preventDefault;
	var clear_data = confirm("Are you sure you want to delete all folders?")
	if (clear_data == true) {
		chrome.storage.sync.clear()
		member_of = []
		init()
	}
})