function Dialog() {
	let msgDialogDelegate;
	this.preventInvokeDelegate = false;

	this.show = function (title, msg, type, callback) {
		switch(type.toLowerCase()) {
			case "success":
				$('#dialog-title-background').css('background-color', '#3F51B5');
				$("#dialog-ok-btn").attr('class', 'btn btn-success btn-block');
				break;
			case "failure":
				$('#dialog-title-background').css('background-color', '#F44336');
				$("#dialog-ok-btn").attr('class', 'btn btn-warning btn-block');
				break;
			case "warning":
				$('#dialog-title-background').css('background-color', '#FF9800');
				$("#dialog-ok-btn").attr('class', 'btn btn-warning btn-block');
				break;
		}
		
		msgDialogDelegate = callback;
		$('#dialog-title').empty();
		$('#dialog-msg').empty();
		$('#dialog-title').append(title);
		$('#dialog-msg').append(msg);
		$('#message-popup').modal('show');
	}
	
	$('#message-popup').on('hidden.bs.modal', function () {
		if (preventInvokeDelegate) {
			preventInvokeDelegate = false;
			return;
		}
		msgDialogDelegate();
	});
	
	$('#dialog-ok-btn').click(function() {
		preventInvokeDelegate = false;
		$('#message-popup').modal('toggle');
	});
}
