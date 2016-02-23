window.api = {
	version: "v1",
	noncePool: [],
	noncePooling: true,
	callbacks: [],
	isReady: false
};

window.api.addToNoncePool = function(callback) {
	if (!window.api.noncePooling) {
		return;
	}
	$.get(window.page.getBasePath() + "/api/" + window.api.version + "/csrfPool", function(ret) {
		// add them to the pool
		for (var nonceIndex in ret.nonces) {
			window.api.noncePool.push(ret.nonces[nonceIndex].nonce);
		}
		callback();
	});
};

window.api.getNonce = function(callback, err) {
	if (window.api.noncePooling) {
		if (window.api.noncePool.length > 0) {
			// that was easy
			callback(window.api.noncePool.pop());
			return;
		} else {
			// this will fallback to a normal request
			// TODO: autofill the pool
		}
	}
	$.get(window.page.getBasePath() + "/api/" + window.api.version + "/csrf", function(ret) {
		callback(ret.nonce);
	});
};

window.api.get = function(path, done, err) {
	window.api.getNonce(function(nonce) {
		$.get(window.page.getBasePath() + "/api/" + window.api.version + "/" + path, { nonce: nonce }, function(ret) {
			done(ret);
		});
	}, err);
};

window.api.post = function(path, data, done, err) {
	window.api.getNonce(function(nonce) {
		var sendData = data;
		sendData.nonce = nonce;
		$.post(window.page.getBasePath() + "/api/" + window.api.version + "/" + path, sendData, function(ret) {
			done(ret);
		});
	}, err);
};

window.api.init = function() {
	window.api.addToNoncePool(function() {
		window.api.isReady = true;
		while (window.api.callbacks.length > 0) {
			var func = window.api.callbacks.pop();
			(func)();
		}
	});
};

window.api.ready = function(callback) {
	if (window.api.isReady) {
		callback();
		return;
	}
	window.api.callbacks.push(callback);
};
