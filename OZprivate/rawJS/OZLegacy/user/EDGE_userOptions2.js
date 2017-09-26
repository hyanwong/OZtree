var draft_only=false;var metadata_cnp_leaf=1;var metadata_cnp_node=1;var UserOptions={polytype:3,viewtype:1,colourtype:5,commonlabels:"true",drawsignposts:"true",leaftype:2,int_highlight_type:2,fonttype:"Helvetica",intcircdraw:"true",sign_background_size:0.35,sign_text_size:0.265,pieborder:0.12,partl2:0.1,total_num_polyt:3,total_num_cols:5,sensitivity:0.84,sensitivity3:0.9,sensitivity2:0.88,mintextsize:4,threshold:2,thresholdtxt:2,growthtimetot:30,allowurlparse:"true",length_init_zoom2:30,init_zoom_speed:1.1,length_intro_in:15,length_intro_in2:8,leaf_outline_def:"rgb(0,150,30)",leaf_fill_def:"rgb(0,100,0)",leaf_text_col_def:"rgb(255,255,255)",brown_branch_def:"rgb(100,75,50)",signpost_col_def:"rgba(255,255,255,0.5)",signpost_txtcol_def:"rgb(0,0,0)",popupbox_col:"rgba(0,0,0,0.85)",popupbox_txtcol:"rgb(255,255,255)",loading_txtcol:"rgb(0,0,0)",pie_background_color:"rgb(255,255,255)",link_background_color:"rgb(255,255,255)",link_highlight_color:"rgb(0,0,0)",intnodetextcolor:"rgb(255,255,255)",backgroundcolor:"rgb(220,235,255)",outlineboxcolor:"rgb(0,0,0)",highlightcolor1:"rgba(255,255,255,0.6)",highlightcolor2:"rgb(190,140,70)",};var PartnerProfiles=[,{profilename:"EDGE",init:1,url:"http://www.edgeofexistence.org",text:"Link to EDGE programme website",name:"EDGE",logo:"logos/EDGE_logo.png",leaf_link_priority:6,},{profilename:"DL",init:1,url:"http://www.DiscoverLife.org",text:"Link to Discover Life",name:"Discover Life",logo:"logos/DL_logo.png",leaf_link_priority:2,node_link_priority:2,},{profilename:"EOL",init:1,url:"http://www.EOL.org",text:"Link to EOL",name:"EOL",leaf_link_priority:3,node_link_priority:3,},{profilename:"Wiki",init:1,url:"http://www.wikipedia.org",text:"Link to Wikipedia",name:"Wikipedia",leaf_link_priority:1,node_link_priority:1,},{profilename:"4Apes",logo:"logos/4apes_logo.png",init:1,url:"http://www.4apes.com",text:"Link to Ape Alliance",name:"Ape Alliance",},{profilename:"MOL",init:1,url:"http://www.mol.org",text:"Link to Map of Life",name:"Map of Life",logo:"http://www.mol.org/sites/all/themes/mol_beep_edition/logo.png",leaf_link_priority:4,},];var linkSet={leaf:[[-1,true,"Wikipedia","http://en.wikipedia.org/wiki/||genus||_||species||"],[-1,true,"Discover Life","http://www.discoverlife.org/mp/20q?search=||genus||+||species||&burl=www.onezoom.org&btxt=Back+to+OneZoom&bi=www.onezoom.org/logos/OZ_logo.png"],[-1,true,"EOL","http://www.eol.org/search?q=||genus||+||species||"],[-1,true,"Map of Life","http://species.mol.org/info/||genus||_||species||"],[-1,true,"ARKive","http://www.arkive.org/explore/species?q=||genus||%20||species||"],[13,true,"EDGE","http://www.edgeofexistence.org/birds/species_info.php?id=||Species_ID||"]],node:[[-1,true,"Wikipedia","http://en.wikipedia.org/wiki/||name||"],[-1,true,"Discover Life","http://www.discoverlife.org/mp/20q?search=||name||&burl=www.onezoom.org&btxt=Back+to+OneZoom&bi=www.onezoom.org/logos/OZ_logo.png"],[-1,true,"EOL","http://www.eol.org/search?q=||name||"],[-1,true,"ARKive","http://www.arkive.org/explore/species?q=||name||"]],};var creditsText=[[3,"OneZoom Tree of Life Explorer"],[2,"www.OneZoom.org"],[2,"Online code version 1.2 (2013)"],[2,"EDGE of Existance data version"],[2,],[2,"A project based at Imperial College London"],[1,],[2,"Funded by the Natural Environment Reseach Council"],[2,],[2,"Created and developed by"],[2,"James Rosindell"],[1,],[2,"With scientific advice from"],[2,"Luke Harmon"],[1,],[2,"With software development assistance from"],[2,"Kai Zhong"],[1,],[2,"Special thanks to"],[1,],[2,"Duncan Gillies  ,  Laura Nunes  and  Yan Wong"],[1,],[2,"Thank you to the scientists who provided the EDGE data"],[2,"Walter Jetz, Gavin Thomas, Jeff Joy,"],[2,"David Redding, Klaas Hartmann and Arne Mooers"],[1,],[2,"Thank you to the EDGE team at ZSL"],[2,"Jamie McCallum , Carly Waterman , Nisha Owen,"],[2,"Jack Stewart and Alasdair Davies"],[2,],[3,"Data sources"],[1,],[2.2,"Conservation status data"],[1.8,"The IUCN Red List of Threatened Species. Version 2012.1."],[1.8,"IUCN, Available from http://www.iucnredlist.org. (2012)"],[1,],[2.2,"Bird data"],[1.8,"Jetz W, Thomas GH, Joy JB, Hartmann K, Mooers AO"],[1.8,"The global diversity of birds in space and time"],[1.8,"Nature 491: 444-448 (2012)"],[1.8,"Also see www.birdtree.org"],[1,],[2.2,"Conservation analysis"],[1.8,"Jetz W, Thomas GH, Joy JB, Redding, Hartmann K, Mooers AO"],[1.8,"Global Distribution and Conservation of Evolutionary Distinctness in Birds"],[1.8,"Current Biology 24: 1–12 (2014)"],[1.8,"http://dx.doi.org/10.1016/j.cub.2014.03.011"],[1.8,"Also see www.birdtree.org"],[1,],[2.2,"Original OneZoom publication reference"],[1.8,"Rosindell J and Harmon LJ"],[1.8,"OneZoom: A Fractal Explorer for the Tree of Life"],[1.8,"PLoS Biology DOI: 10.1371/journal.pbio.1001406 (2012)"],[2,],[2,"Please go to www.OneZoom.org/about.htm for further details"],[1,],[3,"Thank you for using OneZoom"],];midnode.prototype.leafcolor1=function(){if(colourtype==3){return(this.branchcolor())}else{if(colourtype>=4){if((metadata.leaf_meta[this.metacode][9]>4.874)&&(!this.child1)){return redlistcolor("CR")
}else{return(this.branchcolor())}}else{if((colourtype==total_num_cols)&&(l1col_URL)){return(l1col_URL)}else{return(leaf_fill_def)}}}};midnode.prototype.leafcolor2=function(){if(colourtype==3){return(this.branchcolor())}else{if(colourtype==4){return(this.branchcolor())}else{if(colourtype==5){if((metadata.leaf_meta[this.metacode][9]>4.874)&&(!this.child1)){return"rgb(150,0,0)"}else{return leaf_outline_def}}else{if((colourtype==total_num_cols)&&(l2col_URL)){return(l2col_URL)}else{return(leaf_outline_def)}}}}};midnode.prototype.leafcolor3=function(){if((colourtype==total_num_cols)&&(txtcol_URL)){return(txtcol_URL)}else{return(leaf_text_col_def)}};midnode.prototype.nodetextcol=function(){if((colourtype==total_num_cols)&&(txtcol_URL)){return(txtcol_URL)}else{return(intnodetextcolor)}};midnode.prototype.branchcolor=function(){var c=brown_branch_def;if(colourtype==2){if((this.lengthbr<150.8)&&(timelim<150.8)){c="rgb(180,50,25)"}if((this.lengthbr<70.6)&&(timelim<70.6)){c="rgb(50,25,50)"}}else{if(colourtype==3){if(draft_only){if(this.child1){c=redlistcolor(metadata.node_meta[this.metacode][1])}else{c=redlistcolor(metadata.leaf_meta[this.metacode][1])}}else{var a=(4*(this.num_CR)+3*(this.num_EN)+2*(this.num_VU)+this.num_NT);var b=(this.num_CR+this.num_EN+this.num_VU+this.num_NT+this.num_LC);if(b==0){if(((this.num_NE>=this.num_DD)&&(this.num_NE>=this.num_EW))&&(this.num_NE>=this.num_EX)){c=redlistcolor("NE")}else{if((this.num_DD>=this.num_EX)&&(this.num_DD>=this.num_EW)){c=redlistcolor("DD")}else{if(this.num_EW>=this.num_EX){c=redlistcolor("EW")}else{c=redlistcolor("EX")}}}}else{if(b!=0){if((a/b)>3.5){c=redlistcolor("CR")}else{if((a/b)>2.5){c=redlistcolor("EN")}else{if((a/b)>1.5){c=redlistcolor("VU")}else{if((a/b)>0.5){c=redlistcolor("NT")}else{c=redlistcolor("LC")}}}}}}}}else{if(colourtype==4){c=this.EDGE_color()}else{if(colourtype==5){if(this.maxEDGE>=4.874){c=brown_branch_def}else{c=leaf_fill_def}}else{if((colourtype==total_num_cols)&&(b1col_URL)){c=(b1col_URL)}}}}}return c};midnode.prototype.EDGE_color=function(){var a=(1-((fulltree.maxEDGE-this.meanEDGE)/(fulltree.maxEDGE-fulltree.minEDGE)));var b;if((this.meanEDGE)&&(this.meanEDGE>0)){if(a<0.5){b="rgb("+((Math.round(250*a)).toString())+","+(Math.round(125).toString())+",0)"}else{b="rgb("+((Math.round(125)).toString())+","+(Math.round(125+250*(0.5-a)).toString())+",0)"}}else{b="rgb(0,0,0)"}return b};midnode.prototype.barccolor=function(){if(draft_only){return"rgba(0,0,0,0)"}var a="rgba(50,37,25,0.3)";if(colourtype==2){if((this.lengthbr<70.6)&&(timelim<70.6)){a="rgba(200,200,200,0.3)"}}if(colourtype==3){a="rgba(0,0,0,0.3)"}if((colourtype==total_num_cols)&&(b2col_URL)){a=(b2col_URL)}return a};midnode.prototype.highlightcolor=function(){return highlightcolor1};midnode.prototype.highlightcolor2=function(){return highlightcolor2};midnode.prototype.should_highlight1=function(){return(highlight_search&&(this.searchin>0))};midnode.prototype.should_highlight2=function(){return(highlight_search&&(this.searchin2>0))};function redlistcolor(a){switch(a){case"EX":return("rgb(0,0,180)");case"EW":return("rgb(60,50,135)");case"CR":return("rgb(210,0,10)");case"EN":return("rgb(125,50,00)");case"VU":return("rgb(85,85,30)");case"NT":return("rgb(65,120,0)");case"LC":return("rgb(0,180,20)");case"DD":return("rgb(80,80,80)");case"NE":return("rgb(0,0,0)");default:return("rgb(0,0,0)")}}function conconvert(a){switch(a){case"EX":return("Extinct");case"EW":return("Extinct in the Wild");case"CR":return("Critically Endangered");case"EN":return("Endangered");case"VU":return("Vulnerable");case"NT":return("Near Threatened");case"LC":return("Least Concern");case"DD":return("Data Deficient");case"NE":return("Not Evaluated");default:return("Not Evaluated")}}function conconvert2(a){switch(a){case"EX":return(0);case"EW":return(1);case"CR":return(2);case"EN":return(3);case"VU":return(4);case"NT":return(5);case"LC":return(6);case"DD":return(7);case"NE":return(8);default:return(9)}}midnode.prototype.extxt=function(){if(metadata.leaf_meta[this.metacode][4]&&(metadata.leaf_meta[this.metacode][4]!="")){return conconvert(metadata.leaf_meta[this.metacode][4])}else{return("Not Evaluated")}};midnode.prototype.poptxt=function(){if(metadata.leaf_meta[this.metacode][2]){switch(metadata.leaf_meta[this.metacode][2]){case"D":return("decreasing");case"I":return("increasing");case"S":return("stable");case"U":if((metadata.leaf_meta[this.metacode][4]=="EX")||(metadata.leaf_meta[this.metacode][4]=="EW")){return("extinct")}else{return("stability unknown")}default:if((metadata.leaf_meta[this.metacode][4]=="EX")||(metadata.leaf_meta[this.metacode][4]=="EW")){return("extinct")}else{return("stability unknown")}}}else{if((metadata.leaf_meta[this.metacode][4]=="EX")||(metadata.leaf_meta[this.metacode][4]=="EW")){return("extinct")}else{return("stability unknown")}}};function search_substitutions(b){var a=b;a=a.replace("extinct in the wild","EW");a=a.replace("extinct","EX");a=a.replace("critically endangered","CR");a=a.replace("endangered","EN");
a=a.replace("vulnerable","VU");a=a.replace("near threatened","NT");a=a.replace("least concern","LC");a=a.replace("data deficient","DD");a=a.replace("not evaluated","NE");return a}midnode.prototype.dotraitsearch=function(b){var a=0;if((((b=="EX")||(b=="EW"))||(((b=="EN")||(b=="CR"))||((b=="VU")||(b=="NT"))))||(((b=="DD")||(b=="LC"))||(b=="NE"))){if(!(this.child1)){if((metadata.leaf_meta[this.metacode][4])&&(metadata.leaf_meta[this.metacode][4]==b)){a=1}}}else{if(((b.toLowerCase()=="increasing")&&(metadata.leaf_meta[this.metacode][2]))&&(metadata.leaf_meta[this.metacode][2]=="I")){a=1}else{if(((b.toLowerCase()=="decreasing")&&(metadata.leaf_meta[this.metacode][2]))&&(metadata.leaf_meta[this.metacode][2]=="D")){a=1}else{if(((b.toLowerCase()=="stable")&&(metadata.leaf_meta[this.metacode][2]))&&(metadata.leaf_meta[this.metacode][2]=="S")){a=1}else{if((b.toLowerCase()=="threatened")&&((metadata.leaf_meta[this.metacode][4])&&(((metadata.leaf_meta[this.metacode][4]=="CR")||(metadata.leaf_meta[this.metacode][4]=="EN"))||(metadata.leaf_meta[this.metacode][4]=="VU")))){a=1}else{if((!(this.child1))&&((b=="EDGE")&&((metadata.leaf_meta[this.metacode][12])&&(metadata.leaf_meta[this.metacode][12]<=100)))){a=1}}}}}}return a};midnode.prototype.traitprecalc=function(){if(draft_only){if(this.child1){this.richness_val=metadata.node_meta[this.metacode][2]}else{this.richness_val=metadata.leaf_meta[this.metacode][3]}intcircdraw=false}this.num_EX=0;this.num_EW=0;this.num_CR=0;this.num_EN=0;this.num_VU=0;this.num_NT=0;this.num_LC=0;this.num_DD=0;this.num_NE=0;this.num_I=0;this.num_D=0;this.num_S=0;this.num_U=0;this.meanEDGE=0;this.minEDGE=0;this.maxEDGE=0;if(this.child1){(this.child1).traitprecalc();(this.child2).traitprecalc();this.num_EX=((this.child1).num_EX)+((this.child2).num_EX);this.num_EW=((this.child1).num_EW)+((this.child2).num_EW);this.num_CR=((this.child1).num_CR)+((this.child2).num_CR);this.num_EN=((this.child1).num_EN)+((this.child2).num_EN);this.num_VU=((this.child1).num_VU)+((this.child2).num_VU);this.num_NT=((this.child1).num_NT)+((this.child2).num_NT);this.num_LC=((this.child1).num_LC)+((this.child2).num_LC);this.num_DD=((this.child1).num_DD)+((this.child2).num_DD);this.num_NE=((this.child1).num_NE)+((this.child2).num_NE);this.num_I=((this.child1).num_I)+((this.child2).num_I);this.num_D=((this.child1).num_D)+((this.child2).num_D);this.num_S=((this.child1).num_S)+((this.child2).num_S);this.num_U=((this.child1).num_U)+((this.child2).num_U);this.meanEDGE=(((this.child1).meanEDGE*(this.child1).richness_val)+((this.child2).meanEDGE*(this.child2).richness_val))/this.richness_val;this.minEDGE=Math.min((this.child1).minEDGE,(this.child2).minEDGE);this.maxEDGE=Math.max((this.child1).maxEDGE,(this.child2).maxEDGE)}else{this.num_EX=0;this.num_EW=0;this.num_CR=0;this.num_EN=0;this.num_VU=0;this.num_NT=0;this.num_LC=0;this.num_DD=0;this.num_NE=0;this.num_I=0;this.num_D=0;this.num_S=0;this.num_U=0;this.meanEDGE=metadata.leaf_meta[this.metacode][9];this.minEDGE=metadata.leaf_meta[this.metacode][9];this.maxEDGE=metadata.leaf_meta[this.metacode][9];if(metadata.leaf_meta[this.metacode][4]){switch(metadata.leaf_meta[this.metacode][4]){case"EX":this.num_EX=1;break;case"EW":this.num_EW=1;break;case"CR":this.num_CR=1;break;case"EN":this.num_EN=1;break;case"VU":this.num_VU=1;break;case"NT":this.num_NT=1;break;case"LC":this.num_LC=1;break;case"DD":this.num_DD=1;break;case"NE":this.num_NE=1;break;default:this.num_NE=1;break}}else{this.num_NE=1}if(metadata.leaf_meta[this.metacode][2]){switch(metadata.leaf_meta[this.metacode][2]){case"I":this.num_I=1;break;case"S":this.num_S=1;break;case"D":this.num_D=1;break;case"U":this.num_U=1;break;default:this.num_U=1;break}}else{this.num_U=1}}};midnode.prototype.drawInternalTextRough=function(a,d,c){if(!draft_only){context.fillStyle=this.nodetextcol();if((highlight_search)&&(this.searchin>0)){var b=this.searchin;if(this.searchin2){b+=this.searchin2}if(b>1){autotext(false,(b).toString()+" hits",a,d+c*0.7333,c*1.2121,c*0.2666)}else{autotext(false,"1 hit",a,d+c*0.7333,c*1.2121,c*0.2666)}}if(this.name1&&(!commonlabels)){context.fillStyle=this.nodetextcol();autotext(false,(this.richness_val).toString(),a,d-c*0.7333,c*1.2121,c*0.2666);autotext3(true,this.name1,a,d,c*1.6161,c*0.3111)}else{if((metadata.node_meta[this.metacode][0])&&(commonlabels)){context.fillStyle=this.nodetextcol();autotext(false,(this.richness_val).toString(),a,d-c*0.73334,c*1.2121,c*0.2666);autotext3(true,metadata.node_meta[this.metacode][0],a,d,c*1.6161,c*0.31111)}else{context.fillStyle=this.nodetextcol();if(this.lengthbr>0){autotext(false,this.datepart(),a,d+c*0.08888,c*1.847,c*0.4444);autotext(false,(this.richness_val).toString()+" species",a,d-c*0.4444,c*1.2121*1.1,c*0.4444*0.8)}else{autotext(false,(this.richness_val).toString()+" species",a,d+c*0.08888,c*1.847,c*0.4444);autotext(false,"Date unknown",a,d-c*0.4444,c*1.333,c*0.3555)}}}}else{if(this.name1&&(!commonlabels)){context.fillStyle=this.nodetextcol();autotext3(true,this.name1,a,d,c*1.6161,c*0.3111)
}else{if((metadata.node_meta[this.metacode][0])&&(commonlabels)){context.fillStyle=this.nodetextcol();autotext3(true,metadata.node_meta[this.metacode][0],a,d,c*1.6161,c*0.31111)}}}};midnode.prototype.drawLeafTextRough=function(a,c,b){if(!draft_only){context.fillStyle=this.leafcolor3();if(this.iprimaryname()){autotext3(false,this.iprimaryname(),a,c,b*1.6558,b*0.286)}else{if(this.isecondaryname()){autotext3(false,this.isecondaryname(),a,c,b*1.6558,b*0.286)}}if((metadata.leaf_meta[this.metacode][12])&&(metadata.leaf_meta[this.metacode][12]<=100)){drawArc(a,c+b*0.75,b*0.24,0,2*Math.PI,true,"rgb(255,255,255)");drawArc(a,c+b*0.75,b*0.2,0,2*Math.PI,true,"rgb(0,0,0)");context.fillStyle=this.leafcolor3();autotext(false,metadata.leaf_meta[this.metacode][12],a,c+b*0.75,b*0.38,b*0.3)}}};midnode.prototype.drawInternalTextDetail=function(j,f,a){if(!draft_only){var d=[this.num_LC,this.num_NT,this.num_VU,this.num_EN,this.num_CR,this.num_EW,this.num_EX,this.num_DD,this.num_NE];var g=["LC","NT","VU","EN","CR","EW","EX","DD","NE"];var c=[0,0];c.length=9;var m=[0,0];m.length=9;for(i=0;i<g.length;i++){c[i]=redlistcolor(g[i]);m[i]=conconvert(g[i])}var l=[,,"Threatened","Threatened","Threatened",,,,];drawPie(j,f+a*0.7555,a*0.1852,d,c,this.richness_val);drawPieKey(j,f+a*0.4844,a*0.033333,a*0.9,d,c,this.richness_val,m,l,g,this.leafcolor3(),"species");context.fillStyle=this.nodetextcol();autotext(false,"conservation status pie chart",j,f+a*0.37777,a*0.909,a*0.0635);if((this.lengthbr)&&(this.lengthbr>0)){var k;if(this.lengthbr>10){k=(Math.round((this.lengthbr)*10)/10).toString()+" Million years ago"}else{if(this.lengthbr>1){k=(Math.round((this.lengthbr)*100)/100).toString()+" Million years ago"}else{k=(Math.round((this.lengthbr)*10000)/10).toString()+" Thousand years ago"}}autotext(false,k,j,f-a*0.511,a*1.212121,a*0.296);autotext(false,gpmapper(this.lengthbr)+" Period",j,f-a*0.6888,a*1.212121,a*0.08888)}else{autotext(false,"Date unknown",j,f-a*0.511,a*1.212121,a*0.296)}if(this.lengthbr>0){var e;if(this.phylogenetic_diversity>1000){e=(Math.round(this.phylogenetic_diversity/100)/10).toString()+" billion years total phylogenetic diversity"}else{e=(Math.round(this.phylogenetic_diversity)).toString()+" million years total phylogenetic diversity"}autotext(false,e,j,f+a*0.2888,a*1.212121,a*0.0635)}var h;var b=(this.num_CR+this.num_EN+this.num_VU);if((this.iprimaryname())||(this.isecondaryname())){if(b>0){h=(this.richness_val).toString()+" species , "+(b).toString()+" threatened ( "+(Math.round((b)/(this.richness_val)*1000)/10).toString()+"% )"}else{h=(this.richness_val).toString()+" species, none threatened"}}else{if(b>0){if(b>1){h=(b).toString()+" of "+(this.richness_val).toString()+" species are threatened ( "+(Math.round((b)/(this.richness_val)*1000)/10).toString()+"% )"}else{h=(b).toString()+" of "+(this.richness_val).toString()+" species is threatened ( "+(Math.round((b)/(this.richness_val)*1000)/10).toString()+"% )"}}else{h="no threatened species"}}if((highlight_search)&&(this.searchin>0)){if(this.searchin>1){h=h+" , "+(this.searchin).toString()+" hits"}else{h=h+" , 1 hit"}}autotext(false,h,j,f+a*0.2,a*1.4,a*0.0635);if((this.iprimaryname())||(this.isecondaryname())){if(!this.isecondaryname()){autotext2(true,this.iprimaryname(),j,f-a*0.14,a*1.636,a*0.296)}else{if(this.iprimaryname()){autotext(true,this.iprimaryname(),j,f,a*1.636,a*0.2222222);autotext(true,this.isecondaryname(),j,f-a*0.2666,a*1.636,a*0.1777)}else{autotext2(true,this.isecondaryname(),j,f-a*0.14,a*1.636,a*0.296)}}}else{autotext(false,(this.richness_val).toString()+" species",j,f-a*0.14,a*1.636,a*0.296)}this.drawLinkSet(j,f-a*0.8666,a*0.08,a*0.7)}else{this.drawLeafTextRough(j,f,a)}};midnode.prototype.drawLeafTextDetail=function(a,e,c){if(!draft_only){this.drawLinkSet(a,e-c*0.67,c*0.12,c*0.9);context.fillStyle=this.leafcolor3();if(metadata.leaf_meta[this.metacode][0]){if(commonlabels){if(this.name2){autotext(true,this.name2+" "+this.name1,a,e-c*0.45,c,c*0.17)}autotext2(false,metadata.leaf_meta[this.metacode][0],a,e-c*0.1,c*1.36,c*0.26)}else{if(this.name2){autotext2(true,this.name2+" "+this.name1,a,e-c*0.1,c*1.36,c*0.26)}autotext(false,metadata.leaf_meta[this.metacode][0],a,e-c*0.45,c,c*0.1)}}else{autotext(false,"No common name",a,e-c*0.42,c*0.97,c*0.17);if(this.name2){autotext2(true,this.name2+" "+this.name1,a,e,c*1.56,c*0.26)}else{autotext2(true,this.name1,a,e,c*1.59,c*0.26)}}var b=Math.max(metadata.leaf_meta[this.metacode][9]-metadata.leaf_meta[this.metacode][10],metadata.leaf_meta[this.metacode][11]-metadata.leaf_meta[this.metacode][9]);var d=Math.max(metadata.leaf_meta[this.metacode][6]-metadata.leaf_meta[this.metacode][7],metadata.leaf_meta[this.metacode][8]-metadata.leaf_meta[this.metacode][6]);autotext(false,"IUCN conservation status: "+this.extxt(),a,e+c*0.3,c*1.3,c*0.07);autotext(false,"Evolutionary Distinctiveness: "+Math.floor(metadata.leaf_meta[this.metacode][6]*100+0.5)/100+"  (± "+Math.floor(d*100+0.5)/100+")",a,e+c*0.4,c*1.3,c*0.07);autotext(false,"EDGE score: "+Math.floor(metadata.leaf_meta[this.metacode][9]*100+0.5)/100+"  (± "+Math.floor(b*100+0.5)/100+")",a,e+c*0.5,c*1.3,c*0.07);
if(metadata.leaf_meta[this.metacode][12]){autotext(false,"EDGE rank: "+metadata.leaf_meta[this.metacode][12],a,e+c*0.6,c*1.17,c*0.07);if(metadata.leaf_meta[this.metacode][12]<=100){drawArc(a,e+c*0.82,c*0.12,0,2*Math.PI,true,"rgb(255,255,255)");drawArc(a,e+c*0.82,c*0.1,0,2*Math.PI,true,"rgb(0,0,0)");context.fillStyle=this.leafcolor3();autotext(false,metadata.leaf_meta[this.metacode][12],a,e+c*0.82,c*0.18,c*0.1)}}else{autotext(false,"EDGE rank > 1000 ",a,e+c*0.6,c*1.17,c*0.07)}}};