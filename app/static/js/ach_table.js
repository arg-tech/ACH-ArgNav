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


function minXminY(nodeid){
    
    var h_node_tree = h_tnodes_dict[nodeid];
    var minmaxPoints = [];
    
    
    var minX;
    var minY;
    var maxX; 
    var maxY;
    
    for(var i=0; i<h_node_tree.length; i++){
        var aifid = h_node_tree[i];
        var svgid = getSVG_ID(aifid);
        
        var points = d3.select("#" + svgid).select('polygon').attr('points').split(' ');
        var lefttop_x = parseFloat(points[1].split(',')[0]); 
        var lefttop_y = parseFloat(points[1].split(',')[1]);
        var right_bottom_x = parseFloat(points[3].split(',')[0]); 
        var right_bottom_y = parseFloat(points[3].split(',')[1]); 
        
        if(i==0){
            minX = lefttop_x;
            minY = lefttop_y;
            maxX = right_bottom_x;
            maxY = right_bottom_y;
        }
        
        if(lefttop_x < minX) {
            minX = lefttop_x;
        }
        
        if(lefttop_y < minY){
            minY = lefttop_y;
        }
        
        if(right_bottom_x > maxX){
            maxX = right_bottom_x;
        }
        
        if(right_bottom_y > maxY){
            maxY = right_bottom_y;
        }
      
    }
    
    minmaxPoints[0] = minX;
    minmaxPoints[1] = minY;
    minmaxPoints[2] = maxX;
    minmaxPoints[3] = maxY;
    
    return minmaxPoints;
}

function get_svg_edge_id(from, to){
    var edge = from + "," + to;
    
    for(var i=0; i<svg_edge_dict.length; i++){
        if (edge == svg_edge_dict[i]['edge']){
            return svg_edge_dict[i]['nodeid'];
        }
    }
}

function generate_svg_chain($el, nodeid){
    
  
    var minmaxPoints = minXminY(nodeid);
    var minX = minmaxPoints[0];
    var minY = minmaxPoints[1];
    var maxX = minmaxPoints[2];
    var maxY = minmaxPoints[3];
    
    var svgWidth = maxX - minX + 20;
    var svgHeight = maxY - minY + 20;
    
    
    var svg_new = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svg_new.setAttribute('viewBox', "0.00 0.00 " + svgWidth + " " + svgHeight );
    svg_new.setAttribute('xmlns', "http://www.w3.org/2000/svg");
    svg_new.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
    

    var svgNS = svg_new.namespaceURI;
    
    var graphg = document.createElementNS(svgNS, 'g');
    graphg.setAttribute('class', 'graph');
    var transform = "scale(1 1) translate(-" + minX +  " " + minY.toString().replace("-", "") + ")";
    graphg.setAttribute('transform', transform);
    h_node_tree = h_tnodes_dict[nodeid];
    h_edge_tree = h_tedges_dict[nodeid];
    
    
    for(var i=0; i<h_node_tree.length; i++){
        var aifid = h_node_tree[i];
        var svgid = getSVG_ID(aifid);
        
        var gnode = d3.select("#" + svgid);
        var gpolygon = gnode.select('polygon');
        
        var newg = document.createElementNS(svgNS, 'g');
        newg.setAttribute('id', gnode.attr('id'));
        newg.setAttribute('class', gnode.attr('class'));
        
        var newtitle = document.createElementNS(svgNS, 'title');
        var txtnode = document.createTextNode(gnode.select('title').text());
        
        
        newtitle.appendChild(txtnode);
        newg.appendChild(newtitle);
        
        
        var newpolygon = document.createElementNS(svgNS, 'polygon');
        newpolygon.setAttribute('fill', gpolygon.attr('fill'));
        newpolygon.setAttribute('stroke', gpolygon.attr('stroke'));
        newpolygon.setAttribute('points', gpolygon.attr('points'));
        
        newg.appendChild(newpolygon);
        
        var gtext = gnode.selectAll('text')
            .each(function(d) {
                var newTextNode = document.createElementNS(svgNS, 'text');
                newTextNode.setAttribute('text-anchor', d3.select(this).attr('text-anchor'));
                newTextNode.setAttribute('x', d3.select(this).attr('x'));
                newTextNode.setAttribute('y', d3.select(this).attr('y'));
                newTextNode.setAttribute('font-family', d3.select(this).attr('font-family'));
                newTextNode.setAttribute('font-size', d3.select(this).attr('font-size'));
                newTextNode.setAttribute('fill', d3.select(this).attr('fill'));
                
                var contentNode = document.createTextNode(d3.select(this).text());
                newTextNode.appendChild(contentNode);
                newg.appendChild(newTextNode);
     
            });;
        
    
       
        graphg.appendChild(newg);
        
    }
    
    for(var i=0; i<h_edge_tree.length; i++) {
        var edge = h_edge_tree[i];
        var from = edge[0];
        var to = edge[1];
        
        var svg_id = get_svg_edge_id(from, to);
        
        var gedge = d3.select("#" + svg_id);
        var p = gedge.select('path');
        var pol = gedge.select('polygon');
        
        var newg = document.createElementNS(svgNS, 'g');
        newg.setAttribute('id', gedge.attr('id'));
        newg.setAttribute('class', gedge.attr('class'));
        
        var newtitle = document.createElementNS(svgNS, 'title');
        var txtnode = document.createTextNode(gedge.select('title').text());
        
        
        newtitle.appendChild(txtnode);
        newg.appendChild(newtitle);
        
        
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('fill', p.attr('fill'));
        path.setAttribute('stroke', p.attr('stroke'));
        path.setAttribute('d', p.attr('d'));
        newg.appendChild(path);
        
        var polygon = document.createElementNS(svgNS, 'polygon');
        polygon.setAttribute('fill', pol.attr('fill'));
        polygon.setAttribute('stroke', pol.attr('stroke'));
        polygon.setAttribute('points', pol.attr('points'));
        newg.appendChild(polygon);
        
        graphg.appendChild(newg);
    }
    
    
    svg_new.appendChild(graphg);
    
    $el.append('<div style="width:' + svgWidth + 'px; height:' + svgHeight + '"> </div>');
  //  $el.append('<div style="width:3661px"> </div>');
    $el.append(svg_new);
    return $el;
}

$(function() {
        var old_bkgrnd;
        // initialize popover with dynamic content
        $('tr th').popover({
            placement: 'bottom',
            container: 'body',
            html: true,
           // trigger: 'hover',
            trigger: 'manual',
            content: function () {
                    var nodeid = $(this).text().trim().replace("(H)", "");
                
                    if(hypotheses_ids.includes(nodeid)){
                    
                        var nodetxt = inode_txt_list[inode_list.indexOf(nodeid)];
                        var htmlCode = '<div id="chainDivId" class="popover-content"> '+
                       // ' <p class="ow"> <span style="font-size: 10px;"> <span class="fw-bold"> TEXT: </span>' + nodetxt + '</span></p> '+
                        ' <span style="font-size: 10px;"> <span class="fw-bold"> TEXT: </span>' + nodetxt + '</span> <br>'+
                         '<span style="font-size: 9px;"> <span class="fw-bold"> REASONING CHAIN </span> </span>' 
                            '</div>';
                        var $el = $(htmlCode);
                        $el = generate_svg_chain($el, nodeid);
                       
                        return $el;
                    } else {
                        var nodetxt = inode_txt_list[inode_list.indexOf(nodeid)];
                        var htmlCode = '<div id="chainDivId"> '+
                        ' <p class="ow"> <span style="font-size: 10px;"> <span class="fw-bold"> TEXT: </span>' + nodetxt + '</span></p> </div>';
                        var $el = $(htmlCode);
                        return $el;
                    }
                }
            
        }).on("mouseenter", function () {
            var _this = this;
            $(this).popover("show");
            old_bkgrnd = $(this).css("background-color");
            $(this).css("background-color", "darkgray");      
            $(this).siblings(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            
            $(_this).css("background-color", old_bkgrnd);
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide")
                }
            }, 100);
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

      $.fn.closePopover = function(){
        var $this = $(this);
          console.log('IS it ever called???');
          console.log('DATA overPopover' + $this.data('overPopover'));
          console.log('Data over button' + $this.data('overButton'));
        if(!$this.data('overPopover') && !$this.data('overButton')){
            console.log("NOT OVER POPOVER and NOT OVER BUTTON");
          $this.addClass('hide-popover');
          $this.popover('hide');              
        }
      }

      $('tr th').on('shown.bs.popover', function () {
          console.log("ON SHOWN BS POPOVER");
        var $btn = $(this);

        $('.popover-content').on('mouseenter', function (evt){
            console.log("POPOVER CONTENT");
          $btn.data('overPopover', true);
       
           
        });
        $('.popover-content').on('mouseleave', function (evt){
             console.log("POPOVER CONTENT LEAVE");
          $btn.data('overPopover', false);
          setTimeout(function() {$btn.closePopover();}, 100);
        });
      });
    
    });




$(function(){
    $.contextMenu({
        selector: '.context-menu-one', 
        trigger: 'left',
        fontFamily: "Courier New",
        callback: function(key, options) {
            if(key == "map") {
                var aifid =  $(this).text().trim().replace("(H)", "");
                $('.nav-tabs .nav-item a[href="#argMapTab"]').tab('show');
                var node_zoom = i_node_svg_list[inode_list.indexOf(aifid)];
                zoomToPathWithID(node_zoom);
            } 
        },
        items: {
            "map": { name: ' <span class="fw-light small text-wrap"> Show in map </span>' , isHtmlName: true}
            
        }
    });
});

