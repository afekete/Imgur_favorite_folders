var imgURL = chrome.extension.getURL("images/folder.png");
var folder_panel = '<div class="panel">'
var folder_html = '<div class="post folder"><a><img src="'+imgURL+'" alt="" /></a><h2>'

chrome.storage.sync.get(null, function (data){
	for(var key in data) {
		if(data.hasOwnProperty(key)) {
			folder_panel = folder_panel.concat(folder_html+key+'</h2></div>')
		}
	}
	folder_panel = folder_panel.concat('</div>')
	$("#content").prepend(folder_panel)
})

$("#content").on("click", ".folder", function(e) {
	e.preventDefault();
	var folder_name = $(this).children("h2").text()
	var first_child = $("#imagelist .first-child")
	if(first_child.hasClass("active-folder"))
		first_child.remove()
	else
		$("#imagelist .first-child").removeClass("first-child")
	$("#imagelist").prepend('<div class="posts sub-gallery br10 first-child active-folder">')

	var container = $("#imagelist .first-child")
	chrome.storage.sync.get(folder_name, function (data){
		for(var i=0; i<data[folder_name].length; i++) {
			container.append(gen_img_html(data[folder_name][i]))
		}
	})
})

function gen_img_html(img_data) {
	var id = img_data['url'].slice(19)
	var html = '<div id="'+id+'" class="post"><a class="image-list-link" href="'+img_data['url']+'" data-page="0">'
	html = html.concat('<img alt src="'+img_data['thumb']+'" original-title style></a><div class="hover"><p>'+img_data['title']+'</p></div></div>')
	return html
}