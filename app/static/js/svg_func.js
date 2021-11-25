if(hypotheses_svg.length != 0) {
    var initial_polygon_color = d3.select("#"+hypotheses_svg[0]).select('polygon').attr("fill");
    var initial_polygon_stroke = d3.select("#"+hypotheses_svg[0]).select('polygon').attr("stroke");
}
var prev_ach_font_color = [];
var prev_ach_bkgrnd_color = [];
var changed_cells = [];
var changed = false;
var colored_ras = [];
var initial_ra_color;
var initial_ra_stroke;

if(ra_nodes.length > 0){
    
    var raid = ra_nodes[0];
    var ra_svg = getSVG_ID(raid);
    initial_ra_color = d3.select("#"+ra_svg).select('polygon').attr("fill");
    initial_ra_stroke = d3.select("#"+ra_svg).select('polygon').attr("stroke");
}

d3.selectAll('.node')
        .on("click", handleMouseClick)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);




function handleMouseClick(d, i) {
    
    if (d3.event.shiftKey) {
        clicked_node_ID = d3.select(this).select('title').text();
        $('.nav-tabs .nav-item a[href="#achTab"]').tab('show');
        var heads = $('th').each(function() {
            var th = $(this).find("span").text().trim().replace("(H)", "");
            if(clicked_node_ID == th){
                prev_ach_bkgrnd_color.push($(this).css("background-color"));
                prev_ach_font_color.push($(this).css("color"));
                changed_cells.push($(this));
                $(this).css("background-color", "DarkSlateGray")
                     .css("color", "white");
                changed = true;
            } 
        });;
        
        if(!changed){
            alert("Only hypotheses and direct evidence are marked in the ACH matrix.");
        }
        return;
    } else {
    
        clicked_node_ID = d3.select(this).select('title').text();
        
        $('#hypothesesInfo').addClass("d-none");

        if (hypotheses_ids.includes(clicked_node_ID)){
            
            fill_hypotheses_info(clicked_node_ID);
        } else {
            if(scheme_definitions.length > 0) {
                $('#hypothesesInfo').addClass("d-none");
                if(ra_nodes.includes(parseInt(clicked_node_ID))){
                    var scheme_name = get_scheme_name(parseInt(clicked_node_ID));
                    fill_schemes_info(scheme_name);
                }
            }
        }
    }
        
}

function handleMouseOver(d, i) { 
    var visibility = d3.select(this).style("opacity");

    if (visibility < 0.1) {
        d3.select(this).style("cursor", "default");
        d3.select(this).style("opacity", 0);
    } else {
        d3.select(this).style("cursor", "cell");
        d3.select(this).style("opacity", 0.3);
    }
}

function handleMouseOut(d,i) { 
    var visibility = d3.select(this).style("opacity");

    if (visibility < 0.1) {
        d3.select(this).style("cursor", "default");
        d3.select(this).style("opacity", 0);
    } else {
        d3.select(this).style("cursor", "default");
        d3.select(this).style("opacity", 1);
    }
}

function fill_hypotheses_info(clicked_node_ID){
    $('#schemesInfo').addClass("d-none");
    $('#hypothesesInfo').removeClass("d-none");
    
    $("#hypothesisID").text(clicked_node_ID);

    var hypothesisTxt = "\"" + hypotheses[hypotheses_ids.indexOf(clicked_node_ID)].substr(0, 38) + "...\"";
    $('#hypothesisTxt').text(hypothesisTxt);

    var ce = consistent_evidence[clicked_node_ID];

    $("#consistentEvidenceList").empty();

    for(ev in ce){
        var ev_text = "\"" + inode_txt_list[inode_list.indexOf(ce[ev].toString())].substr(0, 55) + "...\"";
         $("#consistentEvidenceList").append('<li>  <span class="fw-light small"> <a class="selected2" href="#">' + ce[ev] + ': </a> </span> ' +
                                     ' <em>  <span id="evidenceTxt" class="fw-light small">' + ev_text + '</span> </em> <br> </li>');
    }
    // do something with "key" and "value" variables

    var ie = inconsistent_evidence[clicked_node_ID];
    $('#inconsistentEvidenceList').empty();

    for(ev in ie){
        var ev_text =  inode_txt_list[inode_list.indexOf(ie[ev].toString())].substr(0, 55) + "...\"";
        $('#inconsistentEvidenceList').append('<li>  <span class="fw-light small"> <a class="selected2" href="#">' + ie[ev] + ': </a> </span> ' +
                                     ' <span id="hypothesisTxt" class="fw-light small"><em>' + ev_text + '</em> </span> <br> </li>');
    }


    $('#alternativeHypothesesList').empty();
     var confl_h = conflicted_hypotheses[clicked_node_ID];
   // $('#alternativeHypothesesList').empty();

    for(h in confl_h){
        var h_txt = inode_txt_list[inode_list.indexOf(confl_h[h].toString())].substr(0, 55) + "...\"";
        $('#alternativeHypothesesList').append('<li> <strong style="color:red;"> X </strong> <span class="fw-light small"> <a class="selected2" href="#">' + confl_h[h] + ': </a> </span> ' +
                                     ' <em>  <span id="evidenceTxt" class="fw-light small">' + h_txt + '</span> </em> <br> </li>');
    }


    var alt_h = alternative_hypotheses[clicked_node_ID];

    for(h in alt_h){
        var h_txt = inode_txt_list[inode_list.indexOf(alt_h[h].toString())].substr(0, 55) + "...\"";
        $('#alternativeHypothesesList').append('<li> <strong style="color:blue;"> ~ </strong> <span class="fw-light small"> <a class="selected2" href="#">' + alt_h[h] + ': </a> </span> ' +
                                     ' <em>  <span id="evidenceTxt" class="fw-light small">' + h_txt + '</span> </em> <br> </li>');
    }
}

$( "#highlightBtn" ).click(function() {
  //console.log(hypotheses_svg);
    for(i=0; i<hypotheses_svg.length; i++) {
       // console.log(hypotheses_svg[i]);
        d3.select("#"+hypotheses_svg[i]).select('polygon')
            .transition()
           // .attr("transform", "translate(0,50)")
            .duration(500)
            .attr("fill", "steelblue");
        
       
    }
});

function revert_ra_colors() {
    for (var i=0; i<colored_ras.length; i++){
         d3.select("#"+colored_ras[i]).select('polygon')
            .transition()
           // .attr("transform", "translate(0,50)")
            .duration(500)
            .attr("fill", initial_ra_color)
            .attr("stroke", initial_ra_stroke);
    }
}

function get_CQs(scheme_name){
    var cqs = [];
    console.log(scheme_name);
    for(var i=0; i<scheme_definitions.length; i++){
        scheme = scheme_definitions[i];
        if(scheme['name'] == scheme_name){
            cqs = scheme['CQ'];
        }
    }
    return cqs;
}

function fill_schemes_info(scheme_name) {
   
    var cqs = get_CQs(scheme_name);

    $('#schemesInfo').removeClass("d-none");
    
    $('#hypothesesInfo').addClass("d-none");
    
    $('#criticalQuestionsList').empty();
    $('#schemeIDtxt').text(scheme_name);
    
    if(cqs.length>0){
        for(i in cqs) {
            $('#criticalQuestionsList').append('<li><span class="fw-light small"> ' +cqs[i] + '</span> </li>');
        }
    } else {
          $('#criticalQuestionsList').append('<li><span class="fw-light small"> The scheme has no critical questions. </span> </li>');
    }
}

$(document).on('click', 'li a.schemelist', function() {
    var selected_scheme = $(this).text().trim();
    console.log('Selected scheme: ' + selected_scheme);
    ra_list = schemes[selected_scheme];
    revert_ra_colors();
    
    for(var i=0; i<ra_list.length; i++){
        var ra_info = ra_list[i];
        var ra_aifid = ra_info[0];
        var svg_id = getSVG_ID(ra_aifid);
        console.log("SVG node: " + svg_id);
        colored_ras.push(svg_id);
        d3.select("#"+svg_id).select('polygon')
            .transition()
           // .attr("transform", "translate(0,50)")
            .duration(500)
            .attr("fill", "darkgreen");
        
        console.log();
    }
    fill_schemes_info(selected_scheme);
    
  
});

function get_scheme_name(aif_id){
    var scheme_name = "";
    for(var i in all_schemes){
        s = all_schemes[i];
        if (s['schemeid'] == aif_id){
            scheme_name = s['scheme'];
        }
    }
    
    return scheme_name;
}

function getSVG_ID(ra_id) {
    console.log(ra_id);
    for (var j = 0; j < svg_dict.length; j++) {
        if(svg_dict[j]['aifid'] == ra_id)
            return(svg_dict[j]['nodeid']);
    }
    return null;
}


$( "#clearBtn" ).click(function() {
  //console.log(hypotheses_svg);
    if(hypotheses_svg.length != 0) {
        for(i=0; i<hypotheses_svg.length; i++) {
           // console.log(hypotheses_svg[i]);
            d3.select("#"+hypotheses_svg[i]).select('polygon')
                .transition()
               // .attr("transform", "translate(0,50)")
                .duration(500)
                .attr("fill", initial_polygon_color)
                .attr("stroke", initial_polygon_stroke);


        }
    }
    
    revert_ra_colors();
});

$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    if(changed) {
        for(var i=0; i<changed_cells.length; i++){
            changed_cells[i].css("background-color", prev_ach_bkgrnd_color[i])
                    .css("color", prev_ach_font_color[i]);
        }
        changed = false;
    }
});

