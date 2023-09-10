regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    exports.validateEmail = function(email) {
        return regex.test(email)
    };
