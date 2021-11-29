# ACH-ArgNav
 Argument navigation tool for Intelligence Analysis

# Using the tool
The Argument Map tab presents a graphical representation of the imported data, while the ACH tab includes the ACH matrix that data generate.
            
 On top of the left side bar there are some analytics about the data, like the number of I-nodes, of RAs, CAs and MAs. It also includes a list with the available argument schemes in data. When clicking on a particular scheme, its argument instances are highlighted in the map, by changing the color of the respective shapes. The definition of that scheme in terms of its critical questions appear at the bottom of the left side bar. That information is also filled by clicking on a specific RA node in the SVG.
  
The "Highlight in map" button indicates the hypotheses in the argument map tab by changing the color of the respective shapes. The "Clear" button reverts any changes made in SVG. 
 
The blue arrow next to the "Show Hypotheses" label, expands a list with the hypotheses, ranked according to the centrality measurement.
      
 When the user clicks on a hypotheses in the SVG file, the left side bar is appended with information about the clicked hypothesis. Information includes alternative hypotheses as well as supporting and attacking direct evidence. Alternative hypotheses with a red X symbol in front of them, are these which are in conflict with the selected one, while those with a blue tilde in front of them, are hypotheses that explain differently the same subset of evidence (are supported by at least one common evidence). Supporting Evidence include the list with the  evidence that infer the selected hypothesis, while Attacking Evidence include those attacking it.  Clicking on any of the id links (or hypothesis in the list of hypotheses) in the left side bar, zooms to the specific node in the svg on the right.

With Shift-Click on some hypothesis or direct evidence, the tab is changed to ACH and the clicked node is highlighted in the matrix by changing the respective cell to dark green.

Cells with the value "consistent" (C) between the corresponding evidence and hypothesis are highlighted with green background, while those with "inconsistent" (I) value, are highlighted with red. N/A value means that the evidence is not related to the respective hypothesis.
            
Hovering over a hypothesis or evidence cell in ACH, a popup appears presenting its propositional content. When cliking on a propositional cell and selecting the "Show in map" option, the tab switches to the Argument map, and zooms to the clicked node.

# Running the tool locally

Run: docker-compose up

The web page listens on port 8181
