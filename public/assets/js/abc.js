function openContent(evt, tabId) {
			var i, tabcontent, tablinks;
			tabcontent = document.getElementsByClassName("tabcontent");
			for (i = 0; i < tabcontent.length; i++) {
				tabcontent[i].style.display = "none";
			}
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}
			document.getElementById(tabId).style.display = "block";

			if (tabId == "tab2") {
				if (getCurrentPlayingIndex() == -1) {
					$('#title_now_playing').text('Not Playing');
				} else {
					$('#title_now_playing').text(listFile[getCurrentPlayingIndex()].name);
				}
			}
			evt.currentTarget.className += " active";
		}

		function getDateTime() {
			var date = new Date();
			var hour = date.getHours();
			hour = (hour < 10 ? "0" : "") + hour;
			var min = date.getMinutes();
			min = (min < 10 ? "0" : "") + min;
			var sec = date.getSeconds();
			sec = (sec < 10 ? "0" : "") + sec;
			return hour + ":" + min + ":" + sec;
		}

		setInterval(function () {
			document.getElementById('logo_and_time').innerHTML = getDateTime();
		}, 1000);

		$("#comment_form").submit(function (e) {
			e.preventDefault();
		});
		// Get list of audio in upload folder
		$.ajax({
			type: 'GET',
			url: '/getlist'
		}).done(function (data) {
			$.each(data, function (index, value) {
				listFile.push({ "name": value, "url": '/upload/' + value });
				var item = $("<li class='songs' id='" + index + "'>" + (index + 1) + ". " + value + "</li>");
				$('#iAudioItem').append(item);
			});
		});

  		var socket = io.connect('http://107.113.186.45:8080');
		socket.on('message', function (data) {
			$('#comment_wrapper').append(data.content);
		});

		$("#send_comment").click(function (e) {
			//var name = 'Hai';
			//var content = $("#subject").val();
			//if (name.length != 0 && content.length != 0) {
			//	$("#messages").prepend(name + ": " + content + "<br>");
			//	socket.emit('messages.create', { name: name, content: content });
			//}
			var name = 'I am a loser';
			var content = $('#comment_content').val();
			if (content.trim().length === 0) {
				return;
			}
			var html = '<div><img src="https://avatarfiles.alphacoders.com/798/79894.jpg" width="55" height="55" alt="pikabob photo avatar"></div>'
				+ '<div>'
				+ '<header><a href="javascript:void(0);">' + name + '</a> - <span>posted 6 days ago</span></header>'
				+ '<p>' + content.trim() + '</a>'
				+ '</p>'
				+ '</div>';
			$('#comment_wrapper').append(html);
			socket.emit('messages.create', { content: html });
		});
