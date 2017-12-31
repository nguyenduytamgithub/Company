function Table(tableId, columns) {
	let cnt = 0;
	let numCols = columns.length;
	let id = '#' + tableId;
	
	function clear() {
		$(id + "-rows").empty();
		$(id + "-rows").append('<tr align="center" class="odd"><td valign="top" colspan="' + numCols + '" class="dataTables_empty">Chưa có dữ liệu</td></tr>');
	}
	this.clear = clear;
	
	function append(item) {
		let index = cnt;
		let htmlContent = '<tr id="' + id + index + '" class="' + ((index % 2) == 0 ? "even" : "odd") + '">';
		$.each(columns, function (idx, column) {
			htmlContent += '<td>' + item[column] + '</td>';
		})
		htmlContent += '</tr>';
		$(id + " > tbody:last-child").append(htmlContent);
		++cnt;
	}
	this.append = append;
	
	this.addItems = function(items) {
		// Cleanup table
		$(id + '-rows').empty();
		if (items.length == 0) {
			clear();
			return;
		}
		// Show item on the table
		$.each(items, function (index, item) {
			append(item);
		});
		
		
	}
	
	this.addClickEvent = function(callback) {
		$(id).find('tr').click( function() {
			if (this.id && this.id.length > 0) {
				callback($(this).index());
			}
		});
	}
}
