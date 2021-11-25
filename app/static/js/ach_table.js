var evidence_list = [];
var ach_matrix = new Array([]);


//$("#ACHtable tr th").mouseover(function(e) {
//        $(this).css("cursor", "pointer");
//    });



function collect_evidence(){
    for(var i in hypotheses_ids) {
        var h = parseInt(hypotheses_ids[i]);
        ce_h = consistent_evidence[h];
        for (var e in ce_h){
            if(!evidence_list.includes(ce_h[e])){
                evidence_list.push(ce_h[e]);
            }
        }
        
        ie_h = inconsistent_evidence[parseInt(h)];
        for(var e in ie_h) {
            if(!evidence_list.includes(ie_h[e])){
                evidence_list.push(ie_h[e]);
            }
        }
    }
    
}

function generate_ach_matrix(){
    //fills the evidence_list
    collect_evidence();   
    
   
    for(let i=0; i < evidence_list.length; i++){
        ach_matrix[i] = {};
        for(let j=0; j < hypotheses_ids.length; j++) {
            h = parseInt(hypotheses_ids[j]);
            e = evidence_list[i];
         //   console.log("Checking hypothesis " + h + " against evidence " + e + "...");
            if(consistent_evidence[h].includes(e) || h == e){
                ach_matrix[i][j] = 'C';
            } else if (inconsistent_evidence[h].includes(e)){
                ach_matrix[i][j] = 'I'
            } else{
                ach_matrix[i][j] = 'N/A';
            }
           // console.log("Ach_matrix[" + i + "][" + j + "] = " + ach_matrix[i][j]);
        }
    }
}

function fill_ach_table(){
    generate_ach_matrix();
    
    var font_size = 9;
    var head_html = '<th scope="col"><span style="font-size: ' + font_size + 'px;"> ' + '#' + '</span>  </th>';

    for(var i in hypotheses_ids) {
        var ach_id = 'H' + i;
        hypothDictionary[ach_id] = hypotheses_ids[i];
        head_html = head_html + '<th class="context-menu-one" scope="row"><span class="" style="font-size: ' + font_size + 'px;">' + hypotheses_ids[i] + '</span> </th>';
    }
    $('#ach_head').append(head_html);
    
    
    var body_html;
    for(let i=0; i< evidence_list.length; i++){
        var evidence_name = evidence_list[i];
        if(hypotheses_ids.includes(evidence_list[i].toString())) {
           evidence_name += '(H)';
        }
        body_html += '  <tr> <th class="context-menu-one" scope="row"> <span style="font-size: ' + font_size + 'px;">' + evidence_name + '</span></th>';
        for(let j=0; j<hypotheses_ids.length; j++){
            if(ach_matrix[i][j] == 'C') {
                 body_html += '<td style="background-color:#00FF00;" ><span class="" style="font-size: ' + font_size + 'px;">' + ach_matrix[i][j] + '</span></td>';
            } else if(ach_matrix[i][j] == 'I'){
                body_html += '<td style="background-color:#FF0000;" ><span class="" style="font-size: ' + font_size + 'px;">' + ach_matrix[i][j] + '</span></td>';
            } else {
                body_html += '<td><span class="" style="font-size: ' + font_size + 'px;">' + ach_matrix[i][j] + '</span></td>';
            }
        }
        body_html += '</tr>';
    }
        
    $('#ach_body').append(body_html);
}

fill_ach_table();

$(function() {
        var old_bkgrnd;
        // initialize popover with dynamic content
        $('tr th').popover({
            placement: 'bottom',
            container: 'body',
            html: true,
            trigger: 'hover',
            content: function () {
                    var nodeid = $(this).text().trim().replace("(H)", "");
                    var nodetxt = inode_txt_list[inode_list.indexOf(nodeid)];
                    return '<p> <span style="font-size: 9px;">' + nodetxt + '</span></p>';
                }
            
        });

        // prevent popover from being hidden on mouseout.
        // only dismiss when explicity clicked (e.g. has .hide-popover)
        $('tr th').on('hide.bs.popover', function(evt) {
            if(!$(evt.target).hasClass('hide-popover')) {
                evt.preventDefault();
                evt.stopPropagation();
                evt.cancelBubble = true;
            }
        });

        // reset helper class when dismissed
        $('tr th').on('hidden.bs.popover', function(evt) {
            $(this).removeClass('hide-popover');
        });


        $('body').on('click', '.popover-dismiss', function() {
            // add helper class to force dismissal
            $('#btnPopover').addClass('hide-popover');

            // call method to hide popover
            $('#btnPopover').popover('hide');
        });

      $('tr th').data('overButton', false);
      $('tr th').data('overPopover', false);
      $.fn.closePopover = function(){
        var $this = $(this);

        if(!$this.data('overPopover') && !$this.data('overButton')){
          $this.addClass('hide-popover');
          $this.popover('hide');              
        }
      }

      //set flags when mouse enters the button or the popover.
      //When the mouse leaves unset immediately, wait a second (to allow the mouse to enter again or enter the other) and then test to see if the mouse is no longer over either. If not, close popover.
      $('tr th').on('mouseenter', function(evt){
        $(this).data('overButton', true);

        old_bkgrnd = $(this).css("background-color");
          $(this).css("background-color", "darkgray");            
      });
      $('tr th').on('mouseleave', function(evt){
        var $btn = $(this);
        $btn.data('overButton', false);
        $(this).css("background-color", old_bkgrnd);
        setTimeout(function() {$btn.closePopover();}, 100);

      });

      $('tr th').on('shown.bs.popover', function () {
        var $btn = $(this);

        $('.popover-content').on('mouseenter', function (evt){
          $btn.data('overPopover', true);
        });
        $('.popover-content').on('mouseleave', function (evt){
          $btn.data('overPopover', false);
          setTimeout(function() {$btn.closePopover();}, 100);
        });
      });
    
    /*    $('tr th').click(function () {  
                $(this).addClass('hide-popover');
                $(this).popover('hide');              
                //$('#navMenu').toggle();
            });  */
    });




$(function(){
    $.contextMenu({
        selector: '.context-menu-one', 
        trigger: 'left',
        callback: function(key, options) {
            var aifid =  $(this).text().trim().replace("(H)", "");
          //  $('.tab-pane[id="#argMapTab"]').tab('show');
          // $("#achTab").removeClass("active");  // this deactivates the home tab
           // $("#argMapTab").addClass("active"); 
           // $("#argMapTab").addClass("active"); 
            $('.nav-tabs .nav-item a[href="#argMapTab"]').tab('show');
            var node_zoom = i_node_svg_list[inode_list.indexOf(aifid)];
            zoomToPathWithID(node_zoom);
        },
        items: {
            "map": { name: "Show in map" }
            
        }
    });
});

/*$("#showACHtxt").click(function() {
 // this deactivates the home tab
    //$( "#tabs" ).tabs({ active: "achTab" });
    $("#achTab").addClass("active"); 
    $("#argMapTab").hide(); 
    $("#argMapTab").removeClass("active"); 
    
});*/


/*var old_bkgrnd;
$( "tr th" ).hover(function() {
    old_bkgrnd = $(this).css("background-color");
    $(this).css("background-color", "darkgray");
    var nodeid = $(this).text().trim().replace("(H)", "");
    var nodetxt = inode_txt_list[inode_list.indexOf(nodeid)];
   // console.log(inode_txt_list[inode_list.indexOf(nodeid)]);
    $(this).popover({
		html: true, 
		container: 'body',
		content: function() {
	            return ' <div id= "ach_info" data-trigger="hover"> ' +
				        '<p id="iNodeACH" class="fw-light small" >' + nodetxt +
                        '<button type="button" class="btn btn-secondary btn-sm"> Show in graph </button> </p> </div>'
	        }
	});
    
}, function(){
    $(this).css("background-color", old_bkgrnd);
});*/

/*$("tr th").popover({
		html: true, 
		content: function() {
            //  old_bkgrnd = $(this).css("background-color");
              $(this).css("background-color", "darkgray");
              var nodeid = $(this).text().trim().replace("(H)", "");
              console.log(inode_txt_list[inode_list.indexOf(nodeid)]);
	          return $('#ach_info').html();
	        }
	});*/
