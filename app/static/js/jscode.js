
    
    $(function() {

  var activate = false,
      tabLinks = $('.tabs a');
      tabContent = $('.tab-content').children();

  //tabLinks.eq(0).addClass('active'); // Add active class, could possibly go in markup
 // $('#achTab').hide(); // Hide second tab
  
  tabLinks.bind('click', function(e) {
      console.log("IN BIND")
    e.preventDefault();
    if(activate === true) { // Only do something if button has been clicked
        console.log("activate=true");
      var target = this.hash,
        el = $(this);

      tabLinks.filter('.active').removeClass('active');
      el.addClass('active');

      tabContent.hide(); // Hide all
      $(target).show(); // Show selected
    }
  });

  $('#showACHtxt').bind('click', function() {
      console.log("CLICKED!");
      
    activate = true; // Activate tab functionality
    tabLinks.eq(1).trigger('click'); // Trigger a click on the second tab link
      $('.nav-tabs .nav-item a[href="#achTab"]').tab('show');
      $("#argMapTab").removeClass("active"); 
  });

});

    
  $("#search_hyp_input").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#list_of_hypotheses li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
