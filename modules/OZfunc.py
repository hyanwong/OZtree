# -*- coding: utf-8 -*-
"""Below are some private functions. NB: https://web2py.wordpress.com/tag/private-function/
Functions that are defined in controllers and that takes arguments are private.
Functions defined in controllers and start with ‘__’ [double underscores] are private.
Functions defined in controllers and having a space after the () and before the ‘:’ are private. 
"""
import re
import os
import random
from gluon import current
from gluon.http import HTTP

def raise_incorrect_url(example_url, info=current.T("Incorrect usage")):
    raise HTTP(400,  info+ "<br />" + current.T("Try e.g. %s") % "<a href='{0}'>{0}</a>".format(example_url), link='<{}>; rel="example"'.format(example_url))

def __check_version(): #this is a private function
    db = current.db
    request = current.request
    try:
        row = db.ordered_nodes[1]
        if row:
            version = -(row.parent) #the version number of the tree is hackily stored as a negative parent of the root
            if not os.path.isfile(os.path.join(request.folder,
                                      "static",
                                      "FinalOutputs",
                                      "data",
                                      "completetree_{}.js".format(version))):
                raise IOError(current.T("completetree file does not exist for version %s") % version)
            return version
        else:
            raise IndexError(current.T("there seems to be no data for tree nodes in the database (the `ordered_nodes` table is not filled out)"))
    except Exception as e:
        return str(e)


def sponsorship_enabled():
    """
    Return whether sponsorship should be allowed on this instance, deriving from:

    * URL "no_sponsoring" parameter
    * sponsorship.allow_sponsorship config option
    * Role of current user (if config is not 1/0/all/none)

    Default to not allowing sponsorships, unless actively turned on
    """
    myconf = current.globalenv['myconf']
    request = current.request
    auth = current.globalenv['Auth']

    if request.vars.no_sponsoring:
        # Shut off sponsoring via. URL param (e.g. museum display on main OZ site)
        return False

    # Read sponsorship setting from config
    try:
        spons = myconf.take('sponsorship.allow_sponsorship')
    except:
        spons = '0'
    if spons.lower() in ['1', 'all']:
        return True
    if spons.lower() in ['0', 'none']:
        return False

    # If anything other than '1' or 'all', treat this as a role, e.g. "manager"
    return auth.has_membership(role=spons)


def clear_reservation(reservations_table_id):
    db = current.db
    keep_fields = ('id', 'OTT_ID', 'num_views', 'last_view')
    del_fields = {f: None for f in db.reservations.fields if f not in keep_fields}
    assert len(keep_fields) + len(del_fields) == len(db.reservations.fields)
    assert reservations_table_id is not None
    db(db.reservations.OTT_ID == reservations_table_id).update(**del_fields)

def add_reservation(OTT_ID_Varin, form_reservation_code, reservation_time_limit, unpaid_time_limit, allow_sponsorship=False, update_view_count=False):
    """
    Try and add a reservation for OTT_ID_Varin
    - form_reservation_code: Temporary identifier for current user
    - allow_sponsorship: Should this instance allow sponsorship?
    - update_view_count: Should the view count for the OTT be incremented?
    - reservation_time_limit: sponsorship.reservation_time_limit_mins config option
    - unpaid_time_limit: sponsorship.unpaid_time_limit_mins config option

    Returns
    - status: String describing reservation status.
    - reservation_row: row from reservations table
    """
    db = current.db
    request = current.request
    # initialise status flag (it will get updated if all is OK)
    status = ""
    reservation_row = None
    # now search for OTTID in the leaf table
    try:
        leaf_entry = db(db.ordered_leaves.ott == OTT_ID_Varin).select().first()
        common_name = get_common_name(OTT_ID_Varin)
        sp_name = leaf_entry.name
    except:
        OTT_ID_Varin = None
        leaf_entry = {}
    if ((not leaf_entry) or             # invalid if not in ordered_leaves
        (leaf_entry.ott is None) or     # invalid if no OTT ID
        (' ' not in leaf_entry.name)):  # invalid if not a sp. name (no space/underscore)
            status = "invalid" # will override maintenance

    if status == "":  # still need to figure out status, but should be able to get data
        # we might come into this with a partner set in request.vars (e.g. LinnSoc)
        """
        TO DO & CHECK - Allows specific parts of the tree to be associated with a partner
        if partner is None:
            #check through partner_taxa for leaves that might match this one
            partner = db((~db.partner_taxa.deactived) & 
                         (db.partner_taxa.is_leaf == True) &
                         (db.partner_taxa.ott == OTT_ID_Varin)
                        ).select(db.partner_taxa.partner_identifier).first()
        if partner is None:
            #pull out potential partner *nodes* that we might need to check
            #also check if this leaf lies within any of the node ranges
            #this should include a join with ordered_nodes to get the ranges, & a select
            partner = db((~db.partner_taxa.deactived) & 
                         (db.partner_taxa.is_leaf == False) &
                         (OTT_ID_Varin >= db.ordered_nodes.leaf_lft) &
                         (OTT_ID_Varin <= db.ordered_nodes.leaf_rgt) &
                         (db.ordered_nodes.ott == db.partner.ott).first()
                        ).select(db.partner_taxa.partner_identifier) 
        """
        # find out if the leaf is banned
        if db(db.banned.ott == OTT_ID_Varin).count() >= 1:
            status = "banned"
        # we need to update the reservations table regardless of banned status)
        reservation_query = db(db.reservations.OTT_ID == OTT_ID_Varin)
        reservation_row = reservation_query.select().first()
        if reservation_row is None:
            # there is no row in the database for this case so add one
            if (status == ""):
                status = "available"
            if status == "available" and allow_sponsorship:
                db.reservations.insert(
                    OTT_ID = OTT_ID_Varin,
                    name=leaf_entry.name,
                    last_view=request.now,
                    num_views=1,
                    reserve_time=request.now,
                    user_registration_id=form_reservation_code)
            else:
                # update with full viewing data but no reservation, even if e.g. banned
                db.reservations.insert(
                    OTT_ID = OTT_ID_Varin,
                    name=leaf_entry.name,
                    last_view=request.now,
                    num_views=1)
        else:
            # there is already a row in the database so update if this is the main visit
            if update_view_count:
                reservation_query.update(
                    last_view=request.now,
                    num_views=(reservation_row.num_views or 0)+1,
                    name=sp_name)

            # this may be available (because valid) but could be
            #  sponsored, unverified, reserved or still available  
            # easiest cases to rule out are relating sponsored and unverified cases.
            # In either case they would appear in the leger
            ledger_user_name = reservation_row.user_sponsor_name
            ledger_PP_transaction_code = reservation_row.PP_transaction_code
            ledger_verified_time = reservation_row.verified_time
            # We know something is fully sponsored if PP transaction code is filled out  
            # NB: this could be with us typing "yet to be paid" in which case
            #  verified_paid can be NULL, so "verified paid " should not be used as a
            #  test of whether something is available or not
            # For forked sites, we do not pass PP transaction code (confidential), so we
            #   have to check first if verified.
            # Need to have another option here if verified_time is too long ago - we
            #  should move this to the expired_reservations table and clear it.
            if (ledger_verified_time):
                status = "sponsored"
            elif status != "banned":
                if (ledger_user_name):
                # something has been filled in
                    if (ledger_PP_transaction_code):
                        #we have a code (or have reserved this taxon)
                        status = "unverified"
                    else:
                        # unverified and unpaid - test time
                        startTime = reservation_row.reserve_time
                        endTime = request.now
                        timesince = ((endTime-startTime).total_seconds())
                        # now we check if the time is too great
                        if (timesince < (unpaid_time_limit)):
                            status = "unverified waiting for payment"
                        else:
                            # We've waited too long and can zap the personal data
                            # previously in the table then set available
                            clear_reservation(OTT_ID_Varin)
                            # Note that this e.g. clears deactivated taxa, etc etc. Even 
                            # if status == available, allow_sponsorship can be False
                            # status is then used to decide the text to show the user
                            status = "available"
                else:
                    # The page has no user name entered & is also valid (not banned etc)
                    # it could only be reserved or available
                    # First thing is to determine time difference since reserved
                    startTime = reservation_row.reserve_time   
                    endTime = request.now
                    if (startTime == None):
                        status = "available"
                        # reserve the leaf because there is no reservetime on record
                        if allow_sponsorship:
                            reservation_query.update(
                                name=sp_name,
                                reserve_time=request.now,
                                user_registration_id=form_reservation_code)
                    else:
                        # compare times to figure out if there is a time difference
                        timesince = ((endTime-startTime).total_seconds())
                        if (timesince < (reservation_time_limit)):
                            release_time = reservation_time_limit - timesince
                            # we may be reserved if it wasn't us
                            if(form_reservation_code == reservation_row.user_registration_id):
                                # it was the same user anyway so reset timer
                                status = "available only to user"
                                if allow_sponsorship:
                                    reservation_query.update(
                                        name=sp_name,
                                        reserve_time=request.now)
                            else:
                                status = "reserved"
                        else:
                            # it's available still
                            status = "available"
                            # reserve the leaf because there is no reservetime on record
                            if allow_sponsorship:
                                reservation_query.update(
                                    name=sp_name,
                                    reserve_time = request.now,
                                    user_registration_id = form_reservation_code)

        #re-do the query since we might have added the row ID now
        reservation_row = reservation_query.select().first()
    return status, reservation_row

def lang_primary(req):
    language=req.vars.lang or req.env.http_accept_language or 'en'
    first_lang = language.split(',')[0]
    return(first_lang.split("-")[0].lower())
    
def sponsorable_children_query(target_id, qtype="ott"):
    """
    A function that returns a web2py query selecting the sponsorable children of this node.
    TO DO: change javascript so that nodes without an OTT use qtype='id'
    """
    db = current.db
    query = child_leaf_query(qtype, target_id)

    #nodes without an OTT are unsponsorable
    query = query & (db.ordered_leaves.ott != None) 

    #nodes without a space in the name are unsponsorable
    query = query & (db.ordered_leaves.name.contains(' ')) 

    #check which have OTTs in the reservations table
    unavailable = db((db.reservations.verified_time != None))._select(db.reservations.OTT_ID)
    #the query above ony finds those with a name. We might prefer something like the below, but I can't get it to work
    #unavailable = db((db.reservations.user_sponsor_name != None) | ((db.reservations.reserve_time != None) & ((request.now - db.reservations.reserve_time).total_seconds() < reservation_time_limit)))._select(db.reservations.OTT_ID)
    
    query = query & (~db.ordered_leaves.ott.belongs(unavailable))
    return(query)

def child_leaf_query(colname, search_for):
    """Queries the db to get child leaves, and returns the basis for another query """
    db = current.db
    try:
        bracket = db(db.ordered_nodes[colname] == search_for).select(db.ordered_nodes.leaf_lft,db.ordered_nodes.leaf_rgt).first()
        if bracket is not None:
            return ((db.ordered_leaves.id >= bracket.leaf_lft) & (db.ordered_leaves.id <= bracket.leaf_rgt))
    except:
        pass
    #if no descendant children, just return this leaf
    return (db.ordered_leaves[colname] == search_for)



def score(lang_full_search, lang_primary_search, lang_full_target, preferred_status, 
    src_flag_target, prefer_short_name=False, max_src_flag=max(current.OZglobals['inv_src_flags'])):
    if prefer_short_name:
        score = max_src_flag - (0 if src_flag_target==current.OZglobals['src_flags']['short_imprecise_name'] else src_flag_target)
    else:
        score = max_src_flag - src_flag_target
    if (lang_full_target == lang_full_search):
        score += 10000
    if (lang_full_target == lang_primary_search):
        score += 1000
    if (preferred_status):
        score += 100
    return score

def add_the(common, leaf):
    """
    "common tern" -> "the common tern", but 'a nematode' kept as is
    NB: this will be difficult to internationalize with gendered words
    """
    if common and not re.match(r'[Aa] ', common):
        if leaf:
            return current.T("the ## singular") + common 
        else:
            return current.T("the ## plural") + common
    else:
        return common

def nice_species_name(scientific=None, common=None, the=False, html=False, leaf=False, first_upper=False, break_line=None):
    """
    Constructs a nice species name, with common name in there too.
    If leaf=True, add a 'species' tag to the scientific name
    If break_line == 1, put a line break after common (if it exists)
    If break_line == 2, put a line break after sciname (even if common exists)
    
    TODO - needs internationalization
    """
    from gluon.html import CAT, I, SPAN, BR
    db = current.db
    species_nicename = (scientific or '').replace('_',' ').strip()
    common = (common or '').strip()
    if the:
        common = add_the(common, leaf)
    if first_upper:
        common = common.capitalize()
    if html:
        if species_nicename:
            if leaf: #species in italics
                species_nicename = I(species_nicename, _class=" ".join(["taxonomy", "species"]))
            else:
                species_nicename = SPAN(species_nicename, _class="taxonomy")
            if common:
                if break_line:
                    return CAT(common, BR(), '(', species_nicename, ')')
                else:
                    return CAT(common, ' (', species_nicename, ')')                
            else:
                if break_line == 2:
                    return CAT(BR(), species_nicename)
                else:
                    return species_nicename
        else:
            return common
    else:
        if common and species_nicename:
            if break_line:
                return common +'\n(' + species_nicename + ')'
            else:
                return common +' (' + species_nicename + ')'
        else:
            if break_line == 2:
                return common + "\n" + species_nicename
            else:
                return common + species_nicename

def get_common_names(identifiers, return_nulls=False, OTT=True, lang=None,
    prefer_short_name=False, include_unpreferred=False, return_all=False):
    """
    Given a set of identifiers (by default, OTTs, but otherwise names), get one best vernacular for each id. 
    'best' is defined as the vernacular that has preferred == True, and which has the best language match.
    Language matches rely on languages specified as http://www.w3.org/International/articles/language-tags/
    A language tag can consist of subtags, e.g. en-gb, fr-ca (these have been made lowercase)
    We call the first subtag the 'primary language', and only match vernaculars where the primary language matches
    However, if there are multiple matches on primary language, we prefer (in order)
    1) Most preferred: a match on full name (e.g. browser language = en-gb, vernacular tagged as en-gb)
    2) Intermediate: the vernacular is tagged as generic (e.g. browser language = en-gb, vernacular tagged as en)
    3) Least preferred: only matches on primary lang (e.g. browser language = en-gb, vernacular tagged as en-us)
   
    If there are multiple equally good matches, we should prefer names in ascending src order, e.g. src=1 (bespoke)
    then src=2 (onezoom_bespoke), ..., unless prefer_short_name is set, when we put short_imprecise_name first
    """
    db = current.db
    request = current.request
    lang_full = (lang or request.vars.lang or request.env.http_accept_language or 'en').split(',')[0].lower()
    lang_primary = lang_full.split("-")[0]
    
    if OTT:
        table = 'vernacular_by_ott'
        col = 'ott'
    else:
        table = 'vernacular_by_name'
        col = 'name'
    query = (db[table][col].belongs(identifiers)) & (db[table].lang_primary == lang_primary)
    if include_unpreferred == False:
        query = query & (db[table].preferred)
    rows = db(query).select(db[table][col], db[table].src, db[table].lang_full, db[table].preferred, db[table].vernacular)
    if return_nulls:
        vernaculars = {i:None for i in identifiers}
    else:
        vernaculars = {}
    
    if return_all:
        for r in rows:
            try:
                vernaculars[r[col]].append(r)
            except:
                vernaculars[r[col]] = [r]
        #sort arrays for each value in vernaculars
        #return {i: ([[r.vernacular, score(lang_full, lang_primary, r.lang_full, r.preferred, r.src, prefer_short_name)] for r in v] if v else None) for i,v in vernaculars.items()}
        return {i: ([r.vernacular for r in sorted(v, key=lambda r: score(lang_full, lang_primary, r.lang_full, r.preferred, r.src, prefer_short_name), reverse=True)] if v else None) for i,v in vernaculars.items()}
        
    else:
        for r in rows:
            rscore = score(lang_full, lang_primary, r.lang_full, r.preferred, r.src, prefer_short_name)
            #find max while looping
            try:
                if vernaculars[r[col]][1] < rscore:
                    raise
            except:
                vernaculars[r[col]] = [r.vernacular, rscore]
        return({v: (vernaculars[v][0] if vernaculars[v] else None) for v in vernaculars})

def get_common_name(ott, name=None, lang=None, include_unpreferred=False):
    """
    The same as get_common_names, but only for a single ott, or if ott is empty, none, etc, use name
    """
    db = current.db
    request = current.request
    lang_full = lang or (request.env.http_accept_language or 'en').lower()
    lang_primary = lang_full.split("-")[0]
    if ott:
        rows =  db((db.vernacular_by_ott.ott == ott) &
                  (db.vernacular_by_ott.preferred == True) &
                  (db.vernacular_by_ott.lang_primary == lang_primary)
                 ).select(
                      db.vernacular_by_ott.src,
                      db.vernacular_by_ott.lang_full,
                      db.vernacular_by_ott.vernacular,
                      db.vernacular_by_ott.preferred
                  )
    elif name:
        rows = db((db.vernacular_by_name.name == name) &
                  (db.vernacular_by_name.preferred == True) &
                  (db.vernacular_by_name.lang_primary == lang_primary)
                 ).select(
                      db.vernacular_by_name.src,
                      db.vernacular_by_name.lang_full,
                      db.vernacular_by_name.vernacular,
                      db.vernacular_by_name.preferred
                  )
    else:
        return None
    if len(rows) == 1:
        return rows[0].vernacular
    else:
        vernacular = None
        for r in rows:
            rscore = score(lang_full, lang_primary, r.lang_full, r.preferred, r.src)
            if vernacular is None or vernacular[1] < rscore:
                vernacular = [r.vernacular, rscore]
        return vernacular[0] if vernacular else None
    
def language(two_letter):
    return current.OZglobals['conversion_table'].get(two_letter)

def punctuation_to_space(unicodetext):
    """
    Convert all space characters, and most punctuation, to normal spaces
    prior to separating search results into words
    """
    return unicodetext.translate(current.OZglobals['unicode_punctuation_to_space_table'])

def is_logographic(word, lang_primary):
    """
    Identify if this search is for logographic (e.g. chinese) characters, in which case 
    we will not want to do a natural language search, and can search for each character 
    independently. Since there is no obvious way to identify logographic characters, we
    only do this if the search is for logographic languages, as described in
    https://en.wikipedia.org/wiki/List_of_writing_systems#Logographic_writing_systems
    which, restricted to extant languages, is only chinese, japanese, and korean
    """
    import string
    if lang_primary not in ["zh", "cnm", "ja", "ko"]:
        return False
    #if the word is in a logographic language but contains any ascii or accented ascii chars, it can be
    #treated as a logographic type, with spaces between words
    return not any(ch in current.OZglobals['logographic_transcriptions'] for ch in word)

def acceptable_sciname(word):
    """
    the following regexp matches characters that are reasonable to accept in scientific name:
    [-./A-Za-z 0-9×αβγδμëüö{}*#]
    (this includes e.g. in bacterial strains etc). If we get a search word containing anything outside these characters, we can treat it as a vernacular name match
    """
    import string
    return all(ch in string.ascii_letters+string.digits+u" -./×αβγδμëüö{}*#" for ch in word) 

def __make_user_code():
    """
    Generate a random string that is unlikely to clash with another. E.g. for the 'ultimate answer' (42)
    100,000 entries 2^42 gives an expected clash rate of 1 in 880.
    
    Eventually, when we also use this to generate registration_ids in the auth_user table, 
    we will want to check here that the random number generated does not exist in the auth_user table
    """
    return '{:x}'.format(random.getrandbits(42))    

def require_https_if_nonlocal() :
    def wrapper(func):
        request=current.request
        if request.function == func.__name__ and not request.is_https and not request.is_local:
            return request.requires_https()
        else:
            return func
    return wrapper
    
def extract_summary(html):
    """
    For the news items, extract the summary by taking the html and simply grabbing the
    text between <span class="summary"> and </span>, and removing any html tags. This is
    a horrible hack, but since it is only us that write news items, it should suffice
    """
    m = re.search(r'<span\s+class\s*=\s*[\'"]summary[\s"\'].*?>(.+?)</span>', html, re.IGNORECASE)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1))
    else:
        return None

def nodes_info_from_array(
    leafIDs_array, nodeIDs_array,
    include_names_in="",
    include_pics=True,
    include_iucn=True,
    image_type='best_any',
    include_sponsorship=True,
    include_pic_details=False,
):
    leafIDs_string = ",".join([str(int(l)) for l in leafIDs_array])
    nodeIDs_string = ",".join([str(int(n)) for n in nodeIDs_array])
    return nodes_info_from_string(
        leafIDs_string, nodeIDs_string,
        include_names_in=include_names_in,
        include_pics=include_pics,
        include_iucn=include_iucn,
        image_type=image_type,
        include_sponsorship=include_sponsorship,
        include_pic_details=include_pic_details,
        check_malicious = False)  # No need to check if badly formed: we have made them

def nodes_info_from_string(
    leafIDs_string, nodeIDs_string,
    include_names_in="",
    include_pics=True,
    include_iucn=True,
    image_type='best_any',
    include_sponsorship=True,
    include_pic_details=False,
    check_malicious=True,
):
    """
    This is the most frequently used function, called primarily by API/node_details.json
    It needs to be very fast, so does a lot of plain SQL command construction.
    
    include_names_in is a string from e.g. request.vars.lang, such as "en-gb, en-us"
    which will get split up
    
    image_type determines not only which type (public domain, verified, etc) to get for
    this taxon, but also which taxa are used as the representative array of images for an
    internal node
    """
    if check_malicious:
        # For speed, we pass leafIDs_string and nodeIDs_string as comma-separated strings
        # straight to SQL, so we should check they don't contain malicious SQL commands
        if re.search("[^\d,]", leafIDs_string) or re.search("[^\d,]", nodeIDs_string):
            #list of ids must only consist of digits and commas
            raise ValueError 
        if re.search("^,|,$|,,", leafIDs_string) or re.search("^,|,$|,,", nodeIDs_string):
            #ban sequential commas, or commas at beginning or end
            raise ValueError
    if image_type not in ("best_verified", "best_pd"):
        image_type = "best_any" #sanitize - only allowed 3 settings

    db = current.db
    nodeOtts = set()
    nodeNames = set()
    leafOtts = set()
    leafNames = set()
    
    
    #Get nodes first and collect OTTs for looking up vernaculars. These contain leaf otts in the representative pictures
    base_ncols = ["id","ott","popularity","age","name","iucnNE","iucnDD","iucnLC","iucnNT","iucnVU","iucnEN","iucnCR","iucnEW","iucnEX"]
    # TODO - there is a bug here where we don't actually substitute {pic} into the name
    pic_ncols = ["{pic}1","{pic}2","{pic}3","{pic}4","{pic}5","{pic}6","{pic}7","{pic}8"]
    pic_col_name = {"best_any": "rep", "best_verified":"rtr", "best_pd":"rpd"}[image_type]
    all_ncols = base_ncols + pic_ncols
    node_cols = {nm:index for index, nm in enumerate(all_ncols)} 
    if nodeIDs_string:
        query1 = "SELECT " + ",".join(all_ncols) + " FROM ordered_nodes WHERE id IN ({user_input})"
        # Must take extreme care here that user_input has been sanitized in the following
        sql = query1.format(pic=pic_col_name, user_input=nodeIDs_string)
        ordered_nodes_query_res = db.executesql(sql)
        for row in ordered_nodes_query_res:
            if row[node_cols['ott']]:
                nodeOtts.add(str(row[node_cols['ott']]))
            elif row[node_cols['name']]: #use name rather than ott if ott does not exist
                nodeNames.add(row[node_cols['name']])

            for i in range(len(base_ncols), len(base_ncols)+len(pic_ncols)):
                if row[i]:
                    leafOtts.add(str(row[i]))
    else:
        ordered_nodes_query_res = []
    #Get leaves next, and add their otts to the leaf pool, for looking up vernaculars and images
    all_lcols = ["id","ott","popularity","name","extinction_date","price"]
    leaf_cols = {nm:index for index,nm in enumerate(all_lcols)} 
    conditions = []
    if leafIDs_string:
        #  must take extreme care here that user_input has been sanitized
        conditions.append("id IN ({user_input})".format(user_input=leafIDs_string)) 
    if len(leafOtts):
        conditions.append("ott IN ({otts_from_pics})".format(otts_from_pics=",".join(leafOtts)))
    if len(conditions):
        query2 = "SELECT " + ",".join(all_lcols) + " FROM ordered_leaves"
        query2 += " WHERE " + " OR ".join(conditions)
        sql = query2
        ordered_leaves_query_res = db.executesql(sql)
        for row in ordered_leaves_query_res:
            if row[leaf_cols['ott']]:
                leafOtts.add(str(row[leaf_cols['ott']]))
            elif row[leaf_cols['name']]:
                leafNames.add(row[leaf_cols['name']])
    else:
        ordered_leaves_query_res = []
    
    #find vernaculars (could be from leaves or nodes)
    #the logic for finding *which* vernaculars to use is in javascript
    #e.g. we probably want to return all 'en-XXX' values, even if the language is en-GB
    #then choose en-GB, en (plain) and en-OTHER in that order
    vernacular_name_query_res = []
    vernacular_name_query_res2 = []
    if include_names_in:
        first_lang = include_names_in.split(',')[0]
        lang_primary = first_lang.split("-")[0]
        if len(nodeOtts) + len(leafOtts):
            query3 = "SELECT ott,vernacular FROM vernacular_by_ott WHERE ott IN ({otts})"
            query3 += " AND lang_primary={}".format(db.placeholder)
            query3 += " AND preferred=TRUE ORDER BY src"
            sql = query3.format(otts=",".join(nodeOtts | leafOtts))
            vernacular_name_query_res = db.executesql(sql, (lang_primary,))
        if len(nodeNames) + len(leafNames):
            names = nodeNames | leafNames
            query4 = "SELECT name,vernacular FROM vernacular_by_name WHERE lang_primary={}".format(db.placeholder)
            query4 += " AND name IN (" + ','.join([db.placeholder]*len(names)) + ")"
            query4 += " AND preferred=TRUE ORDER BY src"
            sql = query4
            vernacular_name_query_res2 = db.executesql(sql, [lang_primary]+list(names))
    
    #find pictures, iucn, and reservation details (only from leaves)
    images_by_ott_query_res = iucn_query_res = reservations_res = None #don't bother getting images for nodes without otts
    if include_pic_details:
        all_pcols = ["ott", "src_id", "src", "rating", "rights", "licence"]
    else:
        all_pcols = ["ott", "src_id", "src", "rating"]
    all_rcols = ["OTT_ID", "verified_kind", "verified_name", "verified_more_info", "verified_url"]
    alt_rtxt = {"verified_name":"'leaf_sponsored'",
                 "verified_more_info":"''",
                 "verified_url":"NULL"}
    pic_cols = {nm:index for index,nm in enumerate(all_pcols)} 
    res_cols = {nm:index for index,nm in enumerate(all_rcols)} 
    if len(leafOtts):
        ott_ids = ",".join(leafOtts) #must be sure there that these are all integers
        if include_pics:
            query5 = "SELECT " + ",".join(all_pcols)
            query5 += " FROM images_by_ott WHERE ott in ({otts})"
            query5 += " AND " + "overall_" + image_type + " = TRUE"
            sql = query5.format(otts=ott_ids)
            # a bit of python hacking here, so that the best src is returned - annoyingly hard to do in SQL
            images_by_ott_query_res = db.executesql(sql)
        if include_iucn:
            query6 = "SELECT ott,status_code FROM iucn WHERE ott in ({otts})"
            sql = query6.format(otts=ott_ids)
            iucn_query_res = db.executesql(sql)
        if include_sponsorship:
            query7 = "SELECT "
            # A very complicated query here, use alternative text if this is not an active
            # node (waiting verification or expired)
            query7 += ",".join(
                ["IF(active,{0},{1}) as {0}".format(nm, alt_rtxt[nm]) 
                    if nm in alt_rtxt else nm for nm in all_rcols])
            query7 += (
                " FROM (SELECT "
                + ",".join(all_rcols)
                + ",(DATE_ADD(verified_time, INTERVAL sponsorship_duration_days DAY) > CURDATE()) AS active FROM reservations"
                + " WHERE OTT_ID in ({otts})"
                +  " AND verified_time IS NOT NULL"
                +  " AND (deactivated IS NULL OR deactivated = '')"
                + ") AS t")
            sql = query7.format(otts=ott_ids)
            reservations_res = db.executesql(sql)
            
    if leafIDs_string or nodeIDs_string:
        return dict(
            nodes=ordered_nodes_query_res or [],
            leaves=ordered_leaves_query_res or [],
            lang=include_names_in,
            vernacular_by_ott=vernacular_name_query_res or [],
            vernacular_by_name=vernacular_name_query_res2 or [], 
            leafIucn=iucn_query_res or [],
            leafPic=images_by_ott_query_res or [],
            reservations=reservations_res or [])
    else:
        # We didn't pass any ids in, so we simply output a list of the column names for 
        # the various arrays. The client can thus make a blank call at the start of a
        # session, and get the column names for later use. We don't need e.g. vernacular
        # or IUCN col names, as these simply map ott or names to a string, as [ott, string]
        # It's only the leaves, nodes, pics, and reservations that have more complex details needed.
        # we also pass out the same values as a call with no IDs, to avoid js errors if accidentally no ids are passed in
        return dict(
            colnames_nodes=node_cols,
            colnames_leaves=leaf_cols, 
            colnames_images=pic_cols,
            colnames_reservations=res_cols,
            nodes=[],
            leaves=[],
            lang=include_names_in,
            vernacular_by_ott=[],
            vernacular_by_name=[],   
            leafIucn=[],
            leafPic=[],
            reservations=[])


def query_val_to_ints(CommaSepString):
    return [int(id) for id in CommaSepString.split(",") if id.isdigit()]

def otts2ids(ottIntegers):
    "Pass in an array of ott ints"
    try:
        db = current.db
        query = db.ordered_nodes.ott.belongs(ottIntegers)
        nodes = db(query).select(db.ordered_nodes.id, db.ordered_nodes.ott, db.ordered_nodes.name)
        query = db.ordered_leaves.ott.belongs(ottIntegers)
        leaves = db(query).select(db.ordered_leaves.id, db.ordered_leaves.ott, db.ordered_leaves.name)
        return {
            "nodes":  {n.ott:n.id for n in nodes},
            "leaves": {n.ott:n.id for n in leaves},
            "names":  dict([(n.ott,n.name) for n in nodes] + [(n.ott,n.name) for n in leaves])
        }
    except:
        return {"nodes": {}, "leaves": {}, "names": {}}
