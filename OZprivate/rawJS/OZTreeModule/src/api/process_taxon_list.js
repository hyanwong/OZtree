/* A function that takes in a list of headers and OTT/names and maps two callback functions onto the list,
 * one for a header line and one for a taxon line */ 

import api_manager from './api_manager'; //for api_manager.ott2id_arry()

/**
 * Takes an list of headings & ott/name entries and applies the callback to each one in turn. This is mainly used for populating
 * the popular species menu, but is kept general so it can be used for a variety of other purposes.
 * @param {Array} orig_taxon_list - an array, each item of which is a string (treated as a header) or a 1 or 2 item array containing
 * the ott or node label and optionally a text label to use. For example taxon_list could be 
 * ['header text',[1234,'name to use],[''
 * @param {Function} taxon_callback - the 4-param UI function [f(ott, used_name, sciname, OZid)] to call on a header string, e.g. adding it to a list
 * @param {Function} header_callback - the 1-param UI function [f(label)] to call on a header string, e.g. adding it to a list
 * @param {Object} data_repo (optional), a data_repo object which will be filled with the ott->OZid mappings generated by the call
 */
export default function (orig_taxon_list, taxon_callback, header_callback, data_repo) {
  if (orig_taxon_list) {
    let taxon_list = JSON.parse(JSON.stringify(orig_taxon_list)); //make a copy
    let taxa = taxon_list.filter(Array.isArray); //filter out the headers
    let unnamed_taxa = taxa.filter(function(arr) {return arr.length < 2});
    // this defines things to send to the API manager.
    let process_taxa = {
      data: {
       ott_array: taxa.map(function(arr){return arr[0]}).join(",")
      },
      success: function(xhr) {
        let res = populate_data_repo_id_ott_map(xhr, data_repo);
        let ott_id_map = res[0];
        let scinames = res[1];
        for (let i = 0; i < taxon_list.length ; i++) {
          if (taxon_list[i].constructor === Array) {
            let ott = taxon_list[i][0].toString();
            let given_name = (taxon_list[i].length>1)?taxon_list[i][1].toString():undefined;
            taxon_callback(ott, given_name, scinames[ott], ott_id_map[ott]);
          } else {
            header_callback(taxon_list[i]);
          }
        }
      }
    };
  
    // this will call the API manager.
    if (unnamed_taxa.length == 0) {
      //all species already have fixed names - just need to do the standard callbacks
      api_manager.ott2id_arry(process_taxa);
    } else {
      //must make an API call to add vernaculars to each item before processing
      let add_vernaculars = {
        data: {
          otts: unnamed_taxa.map(function(arr){return arr[0]}).join(","),
          oz_special: 1, //return the 'onezoom_special' (short) names first
          include_unpreferred: 1
        },
        success: function(xhr) {
          //add names to the unnamed taxa
          for (let i = 0; i < unnamed_taxa.length ; i++) {
            if (xhr.hasOwnProperty(unnamed_taxa[i][0].toString())) {
              unnamed_taxa[i].push(xhr[unnamed_taxa[i][0].toString()]);
            }
          }
          //and then call the main processing function to get the
          api_manager.ott2id_arry(process_taxa);
        }
      }
      api_manager.otts2vns(add_vernaculars);
    }
  }
}
    
function populate_data_repo_id_ott_map(xhr, data_repo) {
    let ott_id_map = {};
    for (let ott in xhr.leaves) {
        if (xhr.leaves.hasOwnProperty(ott)) {
            ott_id_map[ott] = -xhr.leaves[ott];
            if (data_repo) data_repo.id_ott_map[-xhr.leaves[ott]] = ott;
        }
    }
    for (let ott in xhr.nodes) {
        if (xhr.nodes.hasOwnProperty(ott)) {
            ott_id_map[ott] = xhr.nodes[ott];
            if (data_repo) data_repo.id_ott_map[xhr.nodes[ott]] = ott;
        }
    }
    return [ott_id_map, xhr.names];
}


