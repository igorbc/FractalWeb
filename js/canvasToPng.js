function downloadCanvasAsPng(canvas, fileName) {
	console.log("download!");
	canvas.toBlob(function(b){
		var a = document.createElement('a');
		document.body.append(a);
		a.download = fileName;
		a.href = URL.createObjectURL(b);
		
		a.click();

		a.remove();
	}, 'image/png');
}

function download_sprite_as_png(canvas, fileName) {
	canvas.toBlob(function(b){
		console.log(URL.createObjectURL(b));
	}, 'image/png');
}

function openOnNewTab(canvas) {
	canvas.toBlob(function(blob) {
	  var newImg = document.createElement('img'),
	      url = URL.createObjectURL(blob);

	  newImg.onload = function() {
	    // no longer need to read the blob so it's revoked
	    URL.revokeObjectURL(url);
	  };

	  newImg.src = url;
	  document.body.appendChild(newImg);
	  var w = window.open("");
	  w.document.write(newImg.outerHTML);
	});
}
