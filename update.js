/*  */
/* Update UI components */
/*  */

/* Update Jurisdiction Selector */

function Enable_item(it, int, lat){
  it.attr('enabled', 'true')
  int.prop('checked', true)
  int.removeAttr("disabled")
  lat.removeClass('greyed')
}

function Disable_item(it, int, lat){
  it.attr('enabled', 'false')
  int.prop('checked', false)
  int.attr("disabled", true);
  lat.addClass('greyed')
}

/* Update selectors */

function UpdateJuriSelect(cur_pos_juri){

  $('.juri_list_item').each(function(){
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
}

function UpdateSectorSelect(cur_pos_sector){
  $('#sector-selector').children().each(function(){
    selopt = $(this)
    if (selopt.attr('data-ipcc_code') === undefined) return ; // early exit
    cur_pos_sector.includes(selopt.attr('data-ipcc_code'))
      ? $(this).prop('disabled', false)
      : $(this).prop('disabled', true)
  })
}

/* Update charts */

function UpdateChart(sel_data, loc_juri, pricing, sector){

  if(sector.startsWith('1A')){ // multi-bar graph (one for each fuel)
    let sel_data_plus_missing = cur_data.filter(
      d => (d.ipcc_code === sector
              & loc_juri.includes(d.jurisdiction)
            )
    )

    let flat_count = countries.map(d=> d.jurisdiction)
    let flat_can = subnat_can.map(d=> d.jurisdiction)
    let flat_chn = subnat_chn.map(d=> d.jurisdiction)
    let flat_usa = subnat_usa.map(d=> d.jurisdiction)

    ordered_juri = loc_juri.filter(d => flat_count.includes(d))
    ordered_juri = ordered_juri.concat(loc_juri.filter(d => flat_can.includes(d)))
    ordered_juri = ordered_juri.concat(loc_juri.filter(d => flat_chn.includes(d)))
    ordered_juri = ordered_juri.concat(loc_juri.filter(d => flat_usa.includes(d)))

    let dis_data = products.map(d => (
      {
      'name': d,
      'data': sel_data_plus_missing
            .filter(c => c.Product === d)
            .sort((a,b) => ordered_juri.indexOf(a['jurisdiction']) - ordered_juri.indexOf(b['jurisdiction']))
            .map(e => (e[pricing] === 'NA' ? null : Math.round(e[pricing]*100)/100))
      }
      ))

      MultiChart(dis_data, ordered_juri, pricing, $('#sector-selector').select2('data')[0].text)

  } else { // single-bar graph (no fuel-difference)

    let dis_data = sel_data.map(d => (Math.round(d[pricing]*100)/100))
    cur_juri = sel_data.map(d=> d.jurisdiction)
    BarChart(dis_data, loc_juri, pricing, $('#sector-selector').select2('data')[0].text)
    
  }
}

/*  */
/* Update functions */
/*  */

/* Chart updates coming from price and year selectors */

function UpdatePY(){

    let sector = $('#sector-selector').val()
    sector = sector === null ? undefined : sector.split(' ')[0]
    let p2dat = $('#pricing-selector').select2('data')
    let pricing = p2dat[0].prog_value

    let sel_data = cur_data.filter(
        d => (d.ipcc_code === sector
              & d[pricing] !== "NA"
            )
    )

    let loc_juri = sel_data.map(d => d.jurisdiction)
    cur_pos_juri = [...new Set(loc_juri)]
    cur_juri = cur_pos_juri
    
    UpdateJuriSelect(cur_pos_juri)

    let loc_sector =  cur_data
                        .filter(d => d[pricing] !== "NA")
                        .map(d => d.ipcc_code)
    cur_pos_sector = [... new Set(loc_sector)]

    UpdateSectorSelect(cur_pos_sector)

    cur_juri.length === 0 
          ? NoDataChart()
          : UpdateChart(sel_data, cur_pos_juri, pricing, sector)
}

/* Chart updates coming from sector selector */

function UpdateS(){

    let sector = $('#sector-selector').val()
    sector = sector === null ? undefined : sector.split(' ')[0]
    let p2dat = $('#pricing-selector').select2('data')
    let pricing = p2dat[0].prog_value

    let sel_data = cur_data.filter(
        d => (d.ipcc_code === sector
              & d[pricing] !== "NA"
            )
    )

    let loc_juri = sel_data.map(d => d.jurisdiction)
    cur_pos_juri = [...new Set(loc_juri)]
    cur_juri = cur_pos_juri
    
    UpdateJuriSelect(cur_pos_juri)

    cur_juri.length === 0 
      ? NoDataChart()
      : UpdateChart(sel_data, cur_pos_juri, pricing, sector)
}

/* Chart updates coming from juri selector */

function UpdateJ(){

  if(cur_juri.length === 0){
    NoDataChart()
  } else {
    let sector = $('#sector-selector').val()
    sector = sector === null ? undefined : sector.split(' ')[0]
    let p2dat = $('#pricing-selector').select2('data')
    let pricing = p2dat[0].prog_value
  
    let sel_data = cur_data.filter(
        d => (d.ipcc_code === sector
              & cur_juri.includes(d.jurisdiction)
              & d[pricing] !== "NA"
            )
    )
  
    let cur_juri_not_full_NA = sel_data.map(d => d.jurisdiction)
    cur_juri_not_full_NA = [... new Set(cur_juri_not_full_NA)]
  
    UpdateChart(sel_data, cur_juri_not_full_NA, pricing, sector)
  }
}