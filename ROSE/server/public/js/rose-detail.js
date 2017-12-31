var data = {
	mainImgName: '',
	origins: [],
	techInfo: [],
	pests: [],
	colors: [],
	growth: [],
	clear: function() {
		this.origins = [];
		this.techInfo = [];
		this.pests = [];
		this.colors = [];
		this.growth = [];
		this.mainImgName = '';
	},
	colorNames: {},
	originNames: [],
	pestsNames: [],
	imgNames: [],
	idxChange: 0
}

//////////////////////////////////////////////////////////////////////////
//--------------------------------Prepare-------------------------------//
//////////////////////////////////////////////////////////////////////////

function setEmptyTable(tableId) {
	let numCols = 0;
	if (tableId == 'table-techInfo') numCols = 11;
	else if (tableId == 'table-growth') numCols = 11;
	else if (tableId == 'table-origins') numCols = 2;
	else if (tableId == 'table-pests') numCols = 4;
	
	$("#" + tableId + "-rows").empty();
	$("#" + tableId + "-rows").append('<tr align="center" class="odd"><td valign="top" colspan="' + numCols + '" class="dataTables_empty">Chưa có dữ liệu</td></tr>');
}

function clearAlData() {
	data.clear();
	$('#color-tags').empty();
	setEmptyTable("table-techInfo");
	setEmptyTable("table-growth");
	setEmptyTable("table-origins");
	setEmptyTable("table-pests");
}

function registerPopup(buttonId, formId, popupId, willAppear) {
	$('#' + buttonId).click(function() {
		$('#' + formId)[0].reset();
		$('#' + popupId + ' #u-flag').hide();
		$('#' + popupId + ' #a-flag').show();
		willAppear();
		$('#' + formId + ' #warning').hide();
		$('#' + popupId).modal('show');
	});
}

function willAppearPopup(listId, usedData, remainData) {
	listId = '#' + listId;
	$(listId).empty();
	// Filter names in combobox on popup 
	let names = [];
	$.each(usedData, function(idx, pair) {
		names.push(pair.name.toLowerCase());
	});
	$.each(remainData, function(idx, name) {
		if (names.length == 0 || names.indexOf(name.toLowerCase()) < 0) {
			$(listId).append('<option>' + name + '</option>');
		}
	});
}

function preparePopup() {
	// When color textfield changed
	$("color-form #name").on('input', function () {
		var val = this.value;
		if($('#colors-list').find('option').filter(function(){
			return this.value.toUpperCase() === val.toUpperCase();        
		}).length) {
			let hex = data.colorNames[this.value];
			if (hex) {
				$('#color-form').find('input[name="hex"]').val(hex);
				$('#color-picker').colorpicker('setValue', hex);
			}
		}
	});
	
	registerPopup('adding-color-btn', 'color-form', 'color-popup', function() {
		let names = [];
		$.each(data.colorNames, function(key, value) {
			names.push(key);
		});
		willAppearPopup('colors-list', data.colors, names);
		$('#color-picker').colorpicker('setValue', "#00AABB");
	});
	
	registerPopup('table-origins-add-btn', 'origin-form', 'origin-popup', function() {
		willAppearPopup('origins-list', data.origins, data.originNames);
	});
	
	registerPopup('table-pests-add-btn', 'pests-form', 'pests-popup', function() {
		willAppearPopup('pests-list', data.pests, data.pestsNames);
	});

	registerPopup('table-techInfo-add-btn', 'techInfo-form', 'techInfo-popup', function() {});

	registerPopup('table-growth-add-btn', 'growth-form', 'growth-popup', function() {});
}

function prepareData(info) {
	data.origins = info.origins;
	data.techInfo = info.techInfo;
	data.pests = info.pests;
	data.colors = info.colors;
	data.growth = info.growth;
	data.colorNames = info.colorNames;
	data.originNames = info.originNames;
	data.pestsNames = info.pestsNames;
	data.mainImgName = info.mainImgName;
	
	if (data.origins && data.origins.length> 0) {
		tableSubject.onNext({
			formId: 'origin-form',
			popupId: 'origin-popup',
			tableId: 'table-origins',
			columns: ['name', 'year'],
			array: data.origins
		});
	}
	
	if (data.pests && data.pests.length> 0) {
		tableSubject.onNext({
			formId: 'pests-form',
			popupId: 'pests-popup',
			tableId: 'table-pests',
			columns: ['name', 'agent', 'sign', 'solution'],
			array: data.pests
		});
	}

	if (data.techInfo && data.techInfo.length> 0) {
		tableSubject.onNext({
			formId: 'techInfo-form',
			popupId: 'techInfo-popup',
			tableId: 'table-techInfo',
			columns: ['age', 'moisMin', 'moisMax', 'tempMin', 'tempMax', 'pHMin', 'pHMax', 'ECMin', 'ECMax', 'solarMin', 'solarMax'],
			array: data.techInfo
		});
	}

	if (data.growth && data.growth.length> 0) {
		tableSubject.onNext({
			formId: 'growth-form',
			popupId: 'growth-popup',
			tableId: 'table-growth',
			columns: ['age', 'tolerance', 'height', 'width', 'budTime', 'numBuds', 'flowerTime', 'numFlowers', 'diameter', 'numPetals', 'fragrance'],
			array: data.growth
		});
	}
	
	colorSubject.onNext({
		array: data.colors
	});
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//////////////////////////////////////////////////////////////////////////
//-------------------------Process done popup---------------------------//
//////////////////////////////////////////////////////////////////////////
var tableSubject = new Rx.Subject();
// Process event when data changed
tableSubject.subscribe({
	onNext : function(v) {
		// Cleanup table
		let tableId = '#' + v.tableId;
		$(tableId + '-rows').empty();
		if (v.array.length == 0) {
			setEmptyTable(v.tableId);
			return;
		}
		// Show data on the table
		$.each(v.array, function (index, data) {
			let htmlContent = '<tr id="' + tableId + index + '" class="' + ((index % 2) == 0 ? "even" : "odd") + '">';
			$.each(v.columns, function (idx, column) {
				htmlContent += '<td>' + data[column] + '</td>';
			})
			htmlContent += '</tr>';
			$(tableId + " > tbody:last-child").append(htmlContent);
		});
		
		$(tableId).find('tr').click( function() {
			if (this.id && this.id.length > 0) {
				showModifyPopup(v, $(this).index());
			}
		});
	}
});

var colorSubject = new Rx.Subject();
colorSubject.subscribe({
	onNext : function(v) {
		$('#color-tags').empty();
		$.each(v.array, function(idx, data) {
			addColorTag(idx, data);
		});
	}
});

function getValuesOfForm(formId) {
	let vals = {};
	let valuePairs = $(formId).serializeArray();
	$.each(valuePairs, function(index, valuePair) {
		vals[valuePair.name] = valuePair.value;
	});
	return vals;
}

function act(key, type, array, newValue) {
	for (let idx in array) {
		if (array[idx][key] != newValue[key]) {
			continue;
		}
		if (type.toLowerCase() == 'add') {
			return false;
		} else if (data.idxChange != idx) {
			return false;
		}
		else break;
	};
	
	switch(type.toLowerCase()) {
		case 'add':
			array.push(newValue);
			break;
		case 'update':
			array[data.idxChange] = newValue;
			break;
	}
	
	return true;
}

function addColorTag(idx, data) {
	let colorName = data.name;
	let colorHex = data.hex;
	let rgb = hexToRgb(colorHex);
	let textColor = 'white';
	if (rgb.r >= 240 && rgb.r >= 240 && rgb.r >= 240) {
		textColor = 'black';
	}
	
	let html = '<span class="badge" style="color:' + textColor
				+ '; font-size:15px; cursor:pointer; background-color:'
				+ colorHex + ';" onclick="colorTagClicked(' + idx + ')">'
				+ colorName +'</span> <span> </span>';
	$('#color-tags').append(html);
}

function showModifyPopup(info, idx) {
	let formId = '#' + info.formId;
	let array = info.array;
	
	data.idxChange = idx;
	$.each(array[idx], function(key, data) {
		$(formId + (' #' + key)).val(data)
	});
	
	let popupId = '#' + info.popupId;
	$(popupId + ' #a-flag').hide();
	$(popupId + ' #u-flag').show();
	$(formId + ' #warning').hide();
	$(popupId).modal('show');
}

function colorTagClicked(idx) {
	let formId = '#color-form';
	let array = data.colors;
	
	data.idxChange = idx;
	$(formId).find('input[name="name"]').val(array[idx].name);
	$('#color-picker').colorpicker('setValue', array[idx].hex);
	
	let popupId = '#color-popup';
	$(popupId + ' #a-flag').hide();
	$(popupId + ' #u-flag').show();
	$(formId + ' #warning').hide();
	$(popupId).modal('show');
}

function donePopup(info, observer) {
	if (Object.keys(info).length == 0) return;
	
	let array = info.array;
	let type = info.type.toLowerCase();
	let popupId = '#' + info.popupId;
	if (type == 'delete') {
		array.splice(data.idxChange, 1);
	} else {
		let newValue = getValuesOfForm('#' + info.formId);
		let keys = Object.keys(newValue);
		if (keys.length == 0 || newValue[keys[0]].length == 0) {
			// Close the popup
			$(popupId).modal('toggle');
			return;
		}
		
		let success = act(keys[0], type, array, newValue);
		if (!success) {
			$('#' + info.formId + ' #warning').show();
			return;
		}
	}
	observer.onNext(info);
	
	// Close the popup
	$(popupId).modal('toggle');
}

function doneColorTagPopup(type) {
	donePopup({
		type: type,
		formId: 'color-form',
		popupId: 'color-popup',
		array: data.colors
	}, colorSubject);
}

function doneOriginPopup(type) {
	donePopup({
		type: type,
		formId: 'origin-form',
		popupId: 'origin-popup',
		tableId: 'table-origins',
		array: data.origins,
		columns: ['name', 'year']
	}, tableSubject);
}

function donePestsPopup(type) {
	donePopup({
		type: type,
		formId: 'pests-form',
		popupId: 'pests-popup',
		tableId: 'table-pests',
		array: data.pests,
		columns: ['name', 'agent', 'sign', 'solution'],
	}, tableSubject);
}

function doneTechInfoPopup(type) {
	donePopup({
		type: type,
		formId: 'techInfo-form',
		popupId: 'techInfo-popup',
		tableId: 'table-techInfo',
		array: data.techInfo,
		columns: ['age', 'moisMin', 'moisMax', 'tempMin', 'tempMax', 'pHMin', 'pHMax', 'ECMin', 'ECMax', 'solarMin', 'solarMax']
	}, tableSubject);
}

function doneGrowthPopup(type) {
	donePopup({
		type: type,
		formId: 'growth-form',
		popupId: 'growth-popup',
		tableId: 'table-growth',
		array: data.growth,
		columns: ['age', 'tolerance', 'height', 'width', 'budTime', 'numBuds', 'flowerTime', 'numFlowers', 'diameter', 'numPetals', 'fragrance'],
	}, tableSubject);
}

function ready(info) {
	clearAlData();
	preparePopup();
	prepareData(info);
	
	// Button clicked
	$('#color-done-btn').click(function() { doneColorTagPopup('add'); });
	$('#color-delete-btn').click(function() { doneColorTagPopup('delete'); });
	$('#color-update-btn').click(function() { doneColorTagPopup('update'); });
	
	$('#origin-done-btn').click(function() { doneOriginPopup('add'); });
	$('#origin-update-btn').click(function() { doneOriginPopup('update'); });
	$('#origin-delete-btn').click(function() { doneOriginPopup('delete'); });
	
	$('#pests-done-btn').click(function() { donePestsPopup('add'); });
	$('#pests-update-btn').click(function() { donePestsPopup('update'); });
	$('#pests-delete-btn').click(function() { donePestsPopup('delete'); });

	$('#techInfo-done-btn').click(function() { doneTechInfoPopup('add'); });
	$('#techInfo-update-btn').click(function() { doneTechInfoPopup('update'); });
	$('#techInfo-delete-btn').click(function() { doneTechInfoPopup('delete'); });

	$('#growth-done-btn').click(function() { doneGrowthPopup('add'); });
	$('#growth-update-btn').click(function() { doneGrowthPopup('update'); });
	$('#growth-delete-btn').click(function() { doneGrowthPopup('delete'); });
	
	$(function() {
		let dialog = new Dialog();
		
		$('#color-picker').colorpicker();
		
		$('#delete-btn').click(function() {
			dialog.preventInvokeDelegate = true;
			let msg = "Bạn chắc chắn muốn xóa giống hóa này?";
			dialog.show("Xác nhận", msg, "warning", function() {
				$.ajax({
					type: "POST",
					url: info.deleteLink,
					data: { 'roseId': info.roseId },
					success: function(data) {
						let err = data.err;
						if (err) {
							dialog.show(err.title, err.msg, "failure");
						} else {
							let msg = "Đã xóa giống hoa thành công";
							dialog.show("Thành công", msg, "success", function() {
								$(location).attr('href', data.url);
							});
						}
					}
				});
			});
		});
		
		$('#info-form').submit(function(e){
			e.preventDefault();
			
			let formData = getValuesOfForm('#info-form');
			formData['origins'] = data.origins;
			formData['techInfo'] = data.techInfo;
			formData['growth'] = data.growth;
			formData['pests'] = data.pests;
			formData['colors'] = data.colors;
			formData['imgNames'] = data.imgNames;
			formData['roseId'] = info.roseId;
			formData['mainImgName'] = data.mainImgName;
			
			$.ajax({
				type: "POST",
				url: info.submitLink,
				data: formData,
				success: function(data) {
					let err = data.err;
					if (err) {
						dialog.preventInvokeDelegate = true;
						dialog.show(err.title, err.msg, "failure");
					} else {
						let msg = "Đã thêm giống hoa thành công";
						if (info.roseId) msg = "Đã cập nhật giống hoa thành công";
						dialog.show("Thành công", msg, "success", function() {
							$(location).attr('href', data.url);
						});
					}
				},
				error: function(request, status, error) {
					dialog.preventInvokeDelegate = true;
					dialog.show("Lỗi mạng", "Kết nối mạng không ổn định, thêm dữ liệu không thành công", "failure");
				}
			})
		});
	});
}
