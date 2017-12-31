Dropzone.autoDiscover = false;

class RoseDropzone {
	constructor(id, uploadLink, undoLink) {
		this.id = '#' + id;
		this.uploadLink = uploadLink;
		this.undoLink = undoLink;
		$(this.id).addClass('dropzone');
	}
	
	subscribe(roseimgs, callback) {
		let isPrepare = true;
		let mainImgName = "";
		let delegate = callback ? callback : {};
		
		function imageClicked(imgName) {
			hideSelLine();
			showSelLine(imgName);
		}
		
		function hideSelLine() {
			$("#" + mainImgName + "_sel").css("border-color", "#CCC");
			if (delegate.hadMainImgName) delegate.hadMainImgName('');
		}
		
		function showSelLine(imgName) {
			$("#" + imgName + "_sel").css("border-color", "#43A047");
			mainImgName = imgName;
			if (delegate.hadMainImgName) delegate.hadMainImgName(imgName);
		}
		
		function initDropzone() {
			this.on("success", function (file, serverFileName) {
				file.serverFileName = serverFileName;
			});
			
			this.on("complete", function(file) {
				function setup(imgName) {
					if (delegate.add) delegate.add(imgName);
					
					$("#" + imgName + " .dz-remove").text("Xóa hình ảnh này");
					$("#" + imgName + " .dz-remove").css("padding-top", "10px");
					$("#" + imgName + " .dz-remove").before("<div align='center'><div id='" +
													imgName + "_sel'class='normal-line'></div></div>");
					$('#' + imgName).click(function() {
						imageClicked(imgName);
					});
					
					if (mainImgName.length == 0) {
						showSelLine(imgName);
					}
				}
				
				let newFiles = this.getAcceptedFiles();
				if (this.getUploadingFiles().length === 0
					&& this.getQueuedFiles().length === 0
					&& newFiles.length > 0) {
					let idx = 0;
					
					let newImgNames = [];
					$.each(newFiles, function(idx, file) {
						newImgNames.push(file.serverFileName);
					});
					$(id + ' > div').each(function () {
						if (!this.id) {
							this.id = newImgNames[idx];
							setup(newImgNames[idx]);
							++idx;
						}
					});
				} else if (isPrepare) {
					$(".dz-preview:last-child").attr('id', file.serverFileName);
					setup(file.serverFileName);
				}
			});
			
			this.on("removedfile", function(file) {
				let name = file.serverFileName;
				if (!name) name = file.name;
				let newMainName = delegate.remove ? delegate.remove(name) : '';
				$.ajax({
					url: undoLink,
					type: "POST",
					data: {
						filename: name
					},
					success: function() {
						if (mainImgName == name) {
							if (newMainName.length > 0) {
								showSelLine(newMainName);
							} else {
								mainImgName = "";
								hideSelLine();
							}
						}
					}
				});
			});

			this.on("error", function(file) {
				if (!file.accepted) this.removeFile(file);
			});
			
			$(".dz-default").remove();
			loadExistingImages();
			if (delegate.ready) delegate.ready();
		}
		
		function resizeImage(file) {
			return {
				srcX: 0,
				srcY: 0,
				trgX: 0,
				trgY: 0,
				srcWidth: file.width,
				srcHeight: file.height,
				trgWidth: this.options.thumbnailWidth,
				trgHeight: this.options.thumbnailHeight
			};
		}
		
		function renameFile(file) {
			return "{{userId}}_" + Date.now();
		}
		
		let id = this.id;
		let uploadLink = this.uploadLink;
		let undoLink = this.undoLink;
		$(id).dropzone({
			url: uploadLink,
			addRemoveLinks: true,
			maxFiles: 10,
			thumbnailWidth: 120, thumbnailHeight: 120,
			dictMaxFilesExceeded: "Bạn chỉ có thể upload tối đa 10 hình",
			acceptedFiles: "image/png, image/jpeg, image/jpg",
			dictInvalidFileType: "Bạn chỉ có thể upload hình ảnh dạng png, jpeg và jpg",
			resize: resizeImage,
			init: initDropzone,
			renameFile: renameFile
		});
		
		// Add existing images to Dropzone
		function loadExistingImages() {
			if (roseimgs) {
				let myDropzone = Dropzone.forElement(id);
				mainImgName = "main";
				
				$.each(roseimgs, function(idx, data) {
					if (data.isMain) {
						mainImgName = data.name;
					}
					
					let existingFile = {
						serverFileName: data.name,
						name: data.name,
						size: data.size
					};
					
					myDropzone.emit("addedfile", existingFile);
					myDropzone.emit("thumbnail", existingFile, data.path);
					myDropzone.emit("complete", existingFile);
				});
				
				myDropzone.options.maxFiles = myDropzone.options.maxFiles - roseimgs.length;
				if (roseimgs && roseimgs.length > 0) {
					showSelLine(mainImgName);
				} else {
					mainImgName = "";
				}
			} else {
				if (delegate.hadMainImgName) delegate.hadMainImgName('');
			}
			isPrepare = false;
		}
	}
}
