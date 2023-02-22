from flask import render_template, request, redirect, session, Markup, url_for
from . import application
import pandas as pd
from urllib.request import urlopen
from app.centrality import Centrality
from app.svg_parse import SVGParse
from werkzeug.utils import secure_filename
import requests
import json
import urllib
import tempfile
import os
import uuid
#import sys

application.config["UPLOAD_FOLDER"] = "uploaded_data/"
#sys.setrecursionlimit(3000)

@application.route('/')
@application.route('/index')
def index():
    return redirect('/form')


@application.route('/form')
def my_form():
    return render_template('index.html')
    
@application.route('/form', methods=['POST'])
def my_form_post():
    global isAIFdb
    global isMap
    global nodesetID
    #session['nodesetID'] = request.form['nodesetName']
    #nodesetID = session.get('nodesetID', None)
    #isMap = nodesetID.isdigit()
    #isAIFdb = True
    nodesetID = request.form['nodesetName']
    isMap = nodesetID.isdigit()
    isAIFdb = True
    return redirect(url_for('render_results', nodesetID=nodesetID, isMap=isMap, isAIFdb=isAIFdb))

def save_file(f):
    filename = secure_filename(f.filename)
    #f.save(filename)
    #a = 'file uploaded'
    #f.close()
    
    with open(os.path.join(application.config['UPLOAD_FOLDER'], filename), 'w') as newfile:
        newfile.write(f.read().decode())
        
    print(filename + ' saved!')
    return

@application.route('/upload', methods=['POST'])
def uploader():
    global isAIFdb
    global schemesExist
    error = None
    schemesExist = False
    isAIFdb = False
   
   # if 'namejson' not in request.form or 'namesvg' not in request.form:
   #     error = "JSON and SVG data are both required"
   #     return render_template('index.html', error=error)
        
    jsonfile = request.files['namejson']
    svgfile = request.files['namesvg']
    
   
    
    if jsonfile.filename.replace('.json', '') != svgfile.filename.replace('.svg', ''):
        error = "JSON and SVG files don't have the same name"
        return render_template('index.html', error=error)
        
    save_file(jsonfile)
    save_file(svgfile)

    schemesfilename = ""
   # if 'nametxt' in request.form:
    if request.files['nametxt'].filename != '':
        print('nametxt in request.form')
        schemesfile = request.files['nametxt']
        schemesfilename=schemesfile.filename
        save_file(schemesfile)
        schemesExist = True
    
    nodesetID = jsonfile.filename.replace('.json', '')
    isMap = nodesetID.isdigit()

    return redirect(url_for('render_results', jsonfilename=jsonfile.filename, svgfilename=svgfile.filename, schemesfilename=schemesfilename))

@application.route('/results')
def render_results():
    print ("TEST: fired")
    isAIFdb = request.args.get('isAIFdb')
    isMap = request.args.get('isMap')
    nodesetID = request.args.get('nodesetID')
    print (get_info(nodesetID, isMap, isAIFdb, None, None, None))
    global schemesExist
    
    if not isAIFdb:
        jsonfname=request.args['jsonfilename']
        svgfname = request.args['svgfilename']
        schemesfname = request.args['schemesfilename']
        
        nodesetID = jsonfname.replace('.json', '')
        isMap = nodesetID.isdigit()
  
        ordered_nodes, all_nodes, div_nodes, child_nodes, child_edges, s_nodes, ra_nodes, ca_nodes, ma_nodes, l_nodes, l_i_nodes, schemes, schemes_with_conc_prem, all_edges, ordered_hypoth, consistent_evidence, inconsistent_evidence, conflicted_hypotheses, alternative_hypotheses, scheme_definitions, h_tnodes_dict, h_tedges_dict = get_info(nodesetID, isMap, isAIFdb, jsonfname, svgfname, schemesfname)
    else:
          ordered_nodes, all_nodes, div_nodes, child_nodes, child_edges, s_nodes, ra_nodes, ca_nodes, ma_nodes, l_nodes, l_i_nodes, schemes, schemes_with_conc_prem, all_edges, ordered_hypoth, consistent_evidence, inconsistent_evidence, conflicted_hypotheses, alternative_hypotheses, scheme_definitions, h_tnodes_dict, h_tedges_dict = get_info(nodesetID, isMap, isAIFdb, None, None, None)
     
    inodesNo = len(ordered_nodes)
    
     
  #create a pandas dataframe with the I_nodes ordered by their centrality
    df = pd.DataFrame(data=ordered_nodes, columns=['id', 'text'])

    l_node_id = []
    l_node_text = []

    #if IAT mode is true then process L-nodes and lists related to L-nodes otherwise l_nodes list will be blank
    #if iat_mode == 'true':
     #   df_locutions = pd.DataFrame(l_nodes, columns=['id', 'text'])
      #  l_node_id = df_locutions['id'].tolist()
       # l_node_text = df_locutions['text'].tolist()


    #re-index into reverse order - so nodes with highest centrality are at the right end of the dataframe
    df = df[::-1]
    #create a dataframe with all node IDs
    all_nodes_df = pd.DataFrame(data=all_nodes, columns=['id'])
    
    #convert the IDs in ID column to a string - this is needed for later merging and avoids floating points
    all_nodes_df['id'] = all_nodes_df['id'].astype(str)
    df['id'] = df['id'].astype(str)
  #get the SVG file url corresponding to the corpus shortname or nodeset id
    if isAIFdb:
        svg_file = get_svg_file(nodesetID, isMap, isAIFdb, None)
    else:
        svg_file = get_svg_file(nodesetID, isMap, isAIFdb, svgfname)
  #create instance of SVGParse class and then parse the SVG file to get the SVG IDs and corresponding AIFdb node IDs.
    svgp = SVGParse()
    svg = svgp.parse_svg_file(svg_file)
    svg_df = svgp.get_node_ids(svg_file)
    #convert IDs to strings for merging
    svg_df['aifid'] = svg_df['aifid'].astype(str)
    
    svg_edge_df = svgp.get_edge_ids(svg_file)
    svg_edge_dict = svg_edge_df.to_dict(orient = 'records')
    
    #merge the AIFid dataframe with the SVG dataframe
    merged_df = df.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    #get SVGids for all the nodes in a graph
    df_select = all_nodes_df.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    #print(merged_df)
    i_node_list = merged_df['aifid'].tolist()
    i_node_txt_list = merged_df['text'].tolist()
    i_node_svg_list = merged_df['nodeid'].tolist()
    #convert the schemes list of tuples into a dataframe
    df_schemes = pd.DataFrame(schemes, columns=['id', 'scheme', 'i_node_id', 'i_node_text'])
    df_schemes['i_node_id'] = df_schemes['i_node_id'].astype(str)

    #Convert the list of all schemes and the nodes connected to them into a dataframe
    df_all_scheme_nodes = pd.DataFrame(schemes_with_conc_prem, columns=['schemeid', 'scheme', 'i_node_id', 'i_node_text'])
    df_all_scheme_nodes['i_node_id'] = df_all_scheme_nodes['i_node_id'].astype(str)


    #get the SVGids for all the scheme nodes by joining the dataframes
    m_df = merged_df
    df_schemes = df_schemes.merge(m_df, left_on=['i_node_id'], right_on=['aifid'], how='left')
    df_schemes = df_schemes[['id_x', 'scheme', 'nodeid', 'i_node_text']]
    merged_scheme_all_nodes = all_nodes_df.merge(df_all_scheme_nodes, left_on=['id'], right_on=['i_node_id'], how='left')
    merged_scheme_all_nodes_svg = merged_scheme_all_nodes.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    
    merged_df.drop(['id', 'aifid'], axis=1, inplace=True)
    
    svg_nodes = df_select['nodeid'].tolist()
    aif_nodes = df_select['aifid'].tolist()
    
    # df(nodeid, text) : association of svg node id and aif text
    merged_df = merged_df[['nodeid', 'text']]
    
    #convert the dataframe to html to allow easing rendoring on  the results page
    items = merged_df.to_html(header=False, index=False)
    
    #create a column containing a tuple of the svg and aifdb ids for each node
    df_schemes['tup'] = list(zip(df_schemes['id_x'], df_schemes['nodeid'], df_schemes['i_node_text']))
   
    #group the ids by scheme type - this allows filtering by scheme.
    schemes_dict = dict(df_schemes.groupby('scheme')['tup'].apply(list))
    schemes_binary = dict.fromkeys(schemes_dict, 0)

    #convert the schemes to a list of records so that it can be used in javascript.
    all_schemes_svg = merged_scheme_all_nodes_svg.to_dict(orient="records")
    
    df_hypotheses = pd.DataFrame(data=ordered_hypoth, columns=['id', 'text'])
    df_hypotheses = df_hypotheses[::-1]
    df_hypotheses['id'] = df_hypotheses['id'].astype(str)
    hypotheses = list(df_hypotheses['text'])
    hypotheses_ids = list(df_hypotheses['id'])
  #  hypotheses = hypoth_text_col.values
  #  hypoth_id_col = df_hypotheses.loc['id', :]
    svg_hypoth_merged = df_hypotheses.merge(svg_df, left_on=['id'], right_on=['aifid'], how='left')
    svg_dict = svg_df.to_dict(orient = 'records')
   # print('=====SVG DF======')
   # print(svg_df)
    hypotheses_svg = list(svg_hypoth_merged['nodeid'])

    if not isAIFdb:
       
        if os.path.exists(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(svgfname))):
            os.remove(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(svgfname)))
            print(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(svgfname)) + ' removed!')
        if os.path.exists(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(jsonfname))):
            os.remove(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(jsonfname)))
            print(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(jsonfname)) + ' removed!')
        if schemesExist:
            os.remove(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(schemesfname)))
    
    return render_template('results.html', nodesetID=nodesetID, svg=Markup(svg), inodesNo=inodesNo, ra_nodes=ra_nodes, ca_nodes=ca_nodes, ma_nodes=ma_nodes, schemes=schemes_dict, scheme_definitions=scheme_definitions, hypotheses=hypotheses, hypotheses_ids=hypotheses_ids, hypotheses_svg=hypotheses_svg, consistent_evidence=consistent_evidence, inconsistent_evidence=inconsistent_evidence, conflicted_hypotheses=conflicted_hypotheses, alternative_hypotheses=alternative_hypotheses, child_nodes=child_nodes, child_edges=child_edges, svg_nodes=svg_nodes, aif_nodes=aif_nodes, div_nodes=div_nodes, s_nodes=s_nodes, l_node_id=l_node_id, l_node_text=l_node_text, l_i_nodes=l_i_nodes, i_node_list=i_node_list, i_node_txt_list=i_node_txt_list, i_node_svg_list=i_node_svg_list, svg_dict=svg_dict, all_schemes=all_schemes_svg, schemes_show = schemes_binary, all_edges=all_edges, h_tnodes_dict = h_tnodes_dict, h_tedges_dict = h_tedges_dict, svg_edge_dict=svg_edge_dict)
    
    
def get_svg_file(node_id, isMap, isAIFdb, svgfname):
    if isAIFdb:
        c = Centrality()
        node_path = c.create_svg_url(node_id, isMap)
        try:
            file = urlopen(node_path)
            svg = file.read()
        except(IOError):
            print('File was not found:')
            print(node_path)
        return svg
    else:
        try:
            with open(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(svgfname))) as f:
                svg = f.read()
                return svg
        except(IOError):
            print('File was not found:')
            print(node_path)
        return None
   
    

def get_info(node_id, isMap, isAIFdb, jsonfname, svgfname, schemesfname):
    global schemesExist
    
    centra = Centrality()
    #node_path = centra.get_nodeset_path(node_id)
    #Add extension for L-nodes here
    if isAIFdb:
        node_path = centra.create_json_url(node_id, isMap)
        print ('TEST: node_path', node_path, node_id, isMap)
        graph = centra.get_graph_url(node_path)
    else:
        graph = centra.get_graph_json_file(os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(jsonfname)))
    
    print('TEST: graph', graph)

    hypotheses = centra.get_hypotheses(graph)
    graph = centra.remove_iso_nodes(graph)
    l_nodes = centra.get_l_node_list(graph)
    l_node_i_node = centra.get_loc_prop_pair(graph)
    n_graph = centra.remove_redundant_nodes(graph)
    list_of_nodes = centra.list_nodes(graph)
    divergent_nodes = centra.get_divergent_nodes(n_graph)
    s_nodes = centra.get_s_node_list(n_graph)
    ra_nodes = centra.get_ra_node_list(n_graph)
    ca_nodes = centra.get_ca_node_list(n_graph)
    ma_nodes = centra.get_ma_node_list(n_graph)
    i_nodes = centra.get_eigen_centrality(n_graph)
    ordered_nodes = centra.sort_by_centrality(i_nodes)
    ordered_hypoth = centra.order_hypotheses(ordered_nodes, hypotheses)
    children, edges = centra.get_child_edges(n_graph)
    ns, all_edges = centra.get_all_edges(graph)
    schemes = centra.get_schemes(n_graph)
    
    scheme_definitions = []
    if isAIFdb:
        scheme_definitions=centra.get_schemes_definition_live(centra, graph)
    else:
        if schemesExist:
            scheme_definitions=centra.get_schemes_definition_file(centra, graph, os.path.join(application.config['UPLOAD_FOLDER'], secure_filename(schemesfname)))
    
    #  schemes = centra.get_scheme_names(n_graph)
    ra_scheme_i_nodes = centra.get_ra_i_schemes_nodes(graph, schemes)
    all_scheme_nodes = centra.get_all_schemes_nodes(graph, schemes)
    
    
    h_tnodes_dict, h_tedges_dict, h_consistent_evidence = centra.get_hypotheses_trees(graph, hypotheses)
    
    
   # consistent_evidence = centra.find_consistent_evidence(centra, graph, hypotheses)
    h_inconsistent_evidence = centra.find_inconsistent_evidence(centra, graph, hypotheses)
    h_conflicted_hypotheses = centra.find_conflicted_hypotheses(centra, graph, hypotheses)
    h_alternative_hypotheses = centra.find_alternative_hypotheses(centra, graph, hypotheses)
    
    return ordered_nodes, list_of_nodes, divergent_nodes, children, edges, s_nodes, ra_nodes, ca_nodes, ma_nodes, l_nodes, l_node_i_node, ra_scheme_i_nodes, all_scheme_nodes, all_edges, ordered_hypoth, h_consistent_evidence, h_inconsistent_evidence, h_conflicted_hypotheses, h_alternative_hypotheses,  scheme_definitions, h_tnodes_dict, h_tedges_dict
