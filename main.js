/*  */
/* State variables and constants */
/*  */

/* State variables */

var cur_data = []       // current data for selected year
var cur_juri = []       // current select jurisdictions
var cur_pos_juri = []   // current selectable jurisdiction given sector, pricing, and year selected
var cur_pos_sector = [] // current selectable setors given pricing and year selected    
var cur_year = []

/* Constants */ // Some constants are initialized later through one-time data-read

var countries = []      
var subnat_can = []
var subnat_chn = []
var subnat_usa = []
var subnats = []
const subnat_text = ['Canadian provinces', 'Chinese provinces', 'United States states']
const products = ['Coal', 'Natural gas', 'Oil']

/*  */
/* Construct selectors */
/*  */

// Tooltip helpers
d3.selectAll('.helpIcon')
.on('mouseover', function(){
  $(this).attr('opacity', 0.75)
})
.on('mouseout', function(d){
  $(this).attr('opacity', 1)
})

/* Pricing */

$('#pricing-selector').select2({ 
    data: [{
            'id' : 0,
            'text' : 'Carbon Tax',
            'prog_value' : 'tax_rate_incl_ex_kusd'
          },
          {
            'id' : 2,
            'text' : 'Cap and Trade',
            'prog_value' : 'ets_price_kusd'
          }],
    minimumResultsForSearch: Infinity // hides searchbar
  })
  .css('border-color','blue')
  .on('select2:select', function(){UpdatePY()})

/* Sector */

d3.csv('./data/IPCC2006-IEA-category-codes.csv').then(function(data){

  let container = $('#sector-selector')

    const levels = ['Energy', 
                    'Industrial Processes and Product Use',
                    'Agriculture, Forestry and Other Land Use',
                    'Waste',
                    'Other']

    levels.forEach(function(d,i){
        
        var cur_lowest_levels = data.filter(d => (
                            d.lowest_level === "1" &  d.IPCC_CODE.startsWith(i+1)
                            ))
        
        container
          .append($('<optgroup>')
          .attr('label', d)
          )

        cur_lowest_levels.forEach(function(c){
          container
              .append($('<option>')
              .attr('data-ipcc_code', c.IPCC_CODE)
              .text(c.IPCC_CODE + " " +  c.FULLNAME)
              )
        })
    })

    $('#sector-selector')
    .select2({searchInputPlaceholder: 'Search sectors'}) /* https://stackoverflow.com/questions/45819164/how-make-select2-placeholder-for-search-input */
    .on('select2:select', function(){UpdateS()})

/* Year */
  
$('#year-selector').select2({ 
  data: Array.from({length: 31}, (x, i) => 1990 + i),
  minimumResultsForSearch: Infinity // hides searchbar
})
.val(2020).trigger('change')
.on('select2:select', function(){
  cur_year = $('#year-selector').val()
  d3.csv('./data/'+ cur_year +'.csv').then(function(data){
    cur_data = data
    UpdatePY()
  })
})

})

/* Jurisdictions */
  
d3.csv('./data/jurisdictions.csv').then(function(data){

  countries = data
                .filter(d => d.jurtype === 'country')
                .map(d => ({'jurisdiction': d.jurisdiction}))
  subnat_can = data
                .filter(d => d.jurtype === 'subnat_can')
                .map(d => ({'jurisdiction': d.jurisdiction}))
  subnat_chn = data
                .filter(d => d.jurtype === 'subnat_chn')
                .map(d => ({'jurisdiction': d.jurisdiction}))
  subnat_usa = data
                .filter(d => d.jurtype === 'subnat_usa')
                .map(d => ({'jurisdiction': d.jurisdiction}))

  subnats = [{'vari': 'subnat_can', 'text': 'Canadian provinces', 'list': subnat_can},
            {'vari': 'subnat_chn', 'text': 'Chinese provinces', 'list': subnat_chn},
            {'vari': 'subnat_usa', 'text': 'United States states', 'list': subnat_usa}]

  var arr = countries
              .map(function(d,i){return ({val: i, text: d.jurisdiction})})

  var sel = $('.list')

  sel.append(
    $("<li>")
      .addClass('juri-header')
      .append($("<text>")
      .addClass('unselectable')
      .text('National Jurisdictions')
      )
    )

  $(arr).each(function(){createListItem(this, sel)});

  sel.append(
    $("<li>")
      .addClass('juri-header')
      .append($("<text>")
      .addClass('unselectable')
      .text('Subnational Jurisdictions')
      )
    )

  let upper =  Math.max(...arr.map(d => d.val))
  arr = [{'val': upper + 1, 'text': 'Canadian provinces', 'list': subnat_can},
         {'val': upper + 2, 'text': 'Chinese provinces', 'list': subnat_chn},
         {'val': upper + 3, 'text': 'United States states', 'list': subnat_usa}]

  $(arr).each(function(){createGroupListItem(this, sel)});

  var options = {
    valueNames: ['search_name']
  };

  new List('juri-select', options);

})

$('#select_all').click(function(){
    $('.juri_list_item').each(function(){ // Update juri selection menu
      let item = $(this)
      let latem = $('#'+'la_'+ item.attr('common_id'))
      let intem = $('#'+'in_'+ item.attr('common_id'))
      let juri = item.attr('data-juri')
    
      subnat_text.includes(juri)
        ? (
          subnats.forEach(function(d, i){
            if(juri !== d.text) return; // early exit
            d.list.some(d => cur_pos_juri.includes(d.jurisdiction)) ? Enable_item(item, intem, latem) : Disable_item(item, intem, latem)
            })
          )
        : cur_pos_juri.includes(item.attr('data-juri')) ? Enable_item(item, intem, latem) : Disable_item(item, intem, latem)
    })
    cur_juri = cur_pos_juri             // Update chart
    UpdateJ()                         
  });

$('#clear_all').click(function(){
    $(".juri-check").each(function(){
        $(this).removeAttr("checked");
    })  
    cur_juri = []
    UpdateJ()

});

/*  */
/* Initialize Chart and Selectors */
/*  */

//cur_year = $('#year-selector').val()
cur_year = 2020 // Sync issue when passing through iframe (required for integration). For now, move to hardcoded defaults

function waitForElement(){
  if(subnats.length > 0){
    d3.csv('./data/'+ cur_year +'.csv').then(function(data){
      cur_data = data
    
      let sector = '1A1A1 Electricity Generation' // Three next lines (and similar below) adress integration "sync" issues on RFF website
      /* let upinit = $('#sector-selector').val()  */   // whereby, at this stage, $('#sector-selector').val() would sometimes return "undefined"
      /* if(typeof upinit !== "undefined"){let sector = upinit} */ // because of async insues that did not show up in development stage
      // For now, move to hardcoded defaults
    
      sector = sector === null ? undefined : sector.split(' ')[0]
    
      /* let p2dat = $('#pricing-selector').select2('data') */ // See 206
      let pricing = 'tax_rate_incl_ex_kusd'
      /* p2dat[0].prog_value */
    
      let sel_data = cur_data.filter(
          d => (d.ipcc_code === sector
                  & d[pricing] !== "NA"
              )
      )
    
        let loc_juri = sel_data.map(d => d.jurisdiction)
        cur_pos_juri = [...new Set(loc_juri)]
    
        UpdateJuriSelect(cur_pos_juri)
        
        cur_juri = cur_pos_juri
    
        let loc_sector =  cur_data
                            .filter(d => d[pricing] !== "NA")
                            .map(d => d.ipcc_code)
        cur_pos_sector = [... new Set(loc_sector)]
    
        UpdateSectorSelect(cur_pos_sector)
    
        /* Initilaize chart */
    
        let sel_data_plus_missing = cur_data.filter(
            d => (d.ipcc_code === sector
                    & cur_pos_juri.includes(d.jurisdiction)
                  )
          )
    
        let flat_count = countries.map(d=> d.jurisdiction)
        let flat_can = subnat_can.map(d=> d.jurisdiction)
        let flat_chn = subnat_chn.map(d=> d.jurisdiction)
        let flat_usa = subnat_usa.map(d=> d.jurisdiction)
    
        ordered_juri = cur_pos_juri.filter(d => flat_count.includes(d))
        ordered_juri = ordered_juri.concat(cur_pos_juri.filter(d => flat_can.includes(d)))
        ordered_juri = ordered_juri.concat(cur_pos_juri.filter(d => flat_chn.includes(d)))
        ordered_juri = ordered_juri.concat(cur_pos_juri.filter(d => flat_usa.includes(d)))
    
        let dis_data = products.map(d => (
          {
          'name': d,
          'data': sel_data_plus_missing
                .filter(c => c.Product === d)
                .sort((a,b) => ordered_juri.indexOf(a['jurisdiction']) - ordered_juri.indexOf(b['jurisdiction']))
                .map(e => (e[pricing] === 'NA' ? null : Math.round(e[pricing]*100)/100))
          }
          ))
    
        MultiChart(dis_data, ordered_juri, pricing, 
                  /* $('#sector-selector').select2('data')[0].text */ // Sync issue when passing through iframe (required for integration). For now, move to hardcoded defaults
                  '1A1A1 Electricity Generation'
                  )
    })
  }
  else{
      setTimeout(waitForElement, 250);
  }
}

waitForElement()


 
