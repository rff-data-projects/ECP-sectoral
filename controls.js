/*  */
/* State variables and constants */
/*  */

/* State variables */

var cur_data = []       // current data for selected year
var cur_juri = []       // current select jurisdictions
var cur_pos_juri = []   // current selectable jurisdiction given sector, pricing, and year selected
var cur_pos_sector = [] // current selectable setors given pricing and year selected    

/* Constants */ // Some constants are initialized later through one-time data-read

var countries = []      
var subnat_can = []
var subnat_chn = []
var subnat_usa = []
var subnats = []
const subnat_text = ['Canadian provinces', 'Chinese provinces', 'United States states']
const products = ['Coal', 'Natural gas', 'Oil']

/*  */
/* Pricing */
/*  */

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
  .on('select2:select', function(){UpdatePY()})

/*  */
/* Sector */
/*  */

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
})

  $('#sector-selector').select2().on('select2:select', function(){UpdateS()} )


/*  */
/* Year */
/*  */
  
  $('#year-selector').select2({ 
    data: Array.from({length: 31}, (x, i) => 1990 + i),
    minimumResultsForSearch: Infinity // hides searchbar
  })
  .val(2020).trigger('change')
  .on('select2:select', function(){

    let year = $('#year-selector').val()
    d3.csv('./data/'+ year +'.csv').then(function(data){
      cur_data = data
      UpdatePY()
    })

  })

  // Initial data pull
  let year = $('#year-selector').val()
  d3.csv('./data/'+ year +'.csv').then(function(data){
    cur_data = data
  })

/*  */
/* Jurisdictions */
/*  */
  
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
      .append($("<text>")
      .addClass('bold')
      .text('National Jurisdictions')
      )
    )

  $(arr).each(function(){createListItem(this, sel)});

  sel.append(
    $("<li>")
      .append($("<text>")
      .addClass('bold')
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
        $(".juri-check").each(function(){
          let intem = $(this) //Update checked boxes
          if(cur_pos_juri.includes(intem.attr('data-juri')))
            intem.prop("checked", "checked");
          })
          cur_juri = cur_pos_juri //Update chart
          UpdateJ()
    });

$('#clear_all').click(function(){
    $(".juri-check").each(function(){
        $(this).removeAttr("checked");
    })  
    cur_juri = []
        UpdateJ()

});



