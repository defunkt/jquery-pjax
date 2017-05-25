 $(function() {
	 // Get the json string for repo
    $.getJSON('https://api.github.com/repos/defunkt/jquery-pjax/commits?callback=?', function(data) {
		
	var list = $('#committer-list');
	var all_email = []; 	// Collect all emails in committer
	var unique_email = [];	// Collect all unique emails 
	var count_emails = [];	// Count all the commit for specific email

        $.each(data.data, function(key, val) {
			// Populate emails
			all_email.push(val.commit.committer.email);
			unique_email.push(val.commit.committer.email);
		
        });
		
		// get only unique emails
		unique_email = jQuery.unique( unique_email );	
		
		//	Counter to check for unique email occurances
		for ( var i = 0, l = unique_email.length; i < l; i++ ) {
			var temp = 0;
			for ( var j = 0, m = all_email.length; j < m; j++ ){
				if(unique_email[i] == all_email[j])
					temp++;				
			}
			// pair unique emails with their occurances
			count_emails.push([ unique_email[i], temp ]);
		
		}
		
		// function to final output
		for (var i = 0; i < count_emails.length; i++){
				CallFunction(count_emails[i][0], count_emails[i][1]);
			}
		function CallFunction(email, count){
			 list.append('<li>' + email + ' : ' + count + '</li>');
			//	console.log("Email: " + email + ", has committed : " + count + " times");
		}
    });
});
	