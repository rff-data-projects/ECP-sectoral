function createListItem(tthis, sel){

    sel.append($("<li>")
    .attr('id', 'li_'+ tthis.val)  
    .attr('common_id', tthis.val)
    .attr('data-juri', tthis.text)
    .attr('enabled', 'true')
    .addClass('juri_list_item')
    )
  
    let litem = $('#'+ 'li_' + tthis.val)

    litem
    .append($("<input>")
    .attr('type','checkbox')
    .attr('class', 'juri-check')
    .attr('value', tthis.text)
    .attr('id', 'in_' + tthis.val)
    .attr('common_id', tthis.val)
    .attr('data-juri', tthis.text)
    )
    .append($("<label>")
    .addClass( 'search_name')
    .addClass('unselectable')
    .attr('id', 'la_' + tthis.val)
    .attr('common_id', tthis.val)
    .text('\xa0' + tthis.text)
    );
  
    litem
    .click(function(){
      let litem = $(this)
      let intem = $('#'+'in_'+ litem.attr('common_id'))
      let locname = intem.attr('value')

      if(litem.attr('enabled') === 'true'){
        intem.prop("checked")
          ? (
             intem.removeAttr("checked"),
             cur_juri = cur_juri.filter(d => d !== locname).sort()
            ) 
          : (
            intem.prop("checked", "checked"),
            cur_juri.push(locname),
            cur_juri = cur_juri.sort()
            )
        UpdateJ()
      }   
    })
      .children().click(function(e){
  
        let item = $(this)
        let litem = $('#'+'li_'+ item.attr('common_id'))
        let locname = []
        let intem = []

        if(litem.attr('enabled') === 'true'){
          item.prop('class') === 'juri-check'
            ? (     // clicked item is checkbox
                locname = item.attr('value'),
                item.prop("checked") // !! Anticipates current click => true = 'has just been clicked *starting from unchecked*' 
                  ? (
                     cur_juri.push(locname), 
                     cur_juri = cur_juri.sort()
                     )
                  : cur_juri = cur_juri.filter(d => d !== locname).sort()
              )
            : (     // clicked item is label
                intem = $('#'+'in_'+ item.attr('common_id')),
                locname = intem.attr('value'),
                intem.prop("checked")
                  ? (
                    intem.removeAttr("checked"),
                    cur_juri = cur_juri.filter(d => d !== locname).sort()
                    )
                  : (
                    intem.prop("checked", "checked"),
                    cur_juri.push(locname),
                    cur_juri = cur_juri.sort()
                    )
              )
          UpdateJ()
        }
        e.stopPropagation(); // prevent child click from bubbling back up to parent, https://stackoverflow.com/questions/1369035/how-do-i-prevent-a-parents-onclick-event-from-firing-when-a-child-anchor-is-cli
        });
}

function createGroupListItem(tthis, sel){

  sel.append($("<li>")
  .attr('id', 'li_'+ tthis.val)  
  .attr('common_id', tthis.val)
  .attr('data-juri', tthis.text)
  .attr('enabled', 'true')
  .addClass('juri_list_item')
  )

  let litem = $('#'+ 'li_' + tthis.val)

  litem
  .append($("<input>")
  .attr('type','checkbox')
  .attr('class', 'juri-check')
  .attr('value', tthis.text)
  .attr('id', 'in_' + tthis.val)
  .attr('common_id', tthis.val)
  .attr('data-juri', tthis.text)
  .attr('data-list', tthis.list.map(d => d.jurisdiction )) // see https://stackoverflow.com/a/16224029/14095529
  )
  .append($("<label>")
  .addClass( 'search_name')
  .addClass('unselectable')
  .attr('id', 'la_' + tthis.val)
  .attr('common_id', tthis.val)
  .text('\xa0' + tthis.text)
  );

  litem
    .click(function(){                // click event for list item
      let litem = $(this)
      let intem = $('#'+'in_'+ litem.attr('common_id'))
      let locnames = intem.attr('data-list').split(",")  

      if(litem.attr('enabled') === 'false') return; // early exit
      
      intem.prop("checked")
        ? (
          intem.removeAttr("checked"),
          cur_juri = cur_juri.filter(d => !locnames.includes(d)).sort()
          ) 
        : (
          intem.prop("checked", "checked"),
          cur_juri = cur_juri.concat(locnames).sort()
          )
      UpdateJ()
    })
      .children().click(function(e){  // click event for checkbox and label children of list item
  
        let item = $(this)
        let litem = $('#'+'li_'+ item.attr('common_id'))
        let locnames = []
        let intem = []

        if(litem.attr('enabled') === 'false') return; // early exit

        item.prop('class') === 'juri-check'
          ? (     // clicked item is checkbox
            locnames = item.attr('data-list').split(",") ,
            item.prop("checked") // !! Anticipates current click => true = 'has just been clicked *starting from unchecked*' 
              ? cur_juri = cur_juri.concat(locnames).sort()
              : cur_juri = cur_juri.filter(d => !locnames.includes(d)).sort()
            )
          : (     // clicked item is label
            intem = $('#'+'in_'+ item.attr('common_id')),
            locnames = intem.attr('data-list').split(",") ,
            intem.prop("checked")
              ? (
                intem.removeAttr("checked"),
                cur_juri = cur_juri.filter(d => !locnames.includes(d)).sort()
                )
              : (
                intem.prop("checked", "checked"),
                cur_juri = cur_juri.concat(locnames).sort()
                )
            )
        UpdateJ()
        e.stopPropagation(); // prevent child click from bubbling back up to parent, https://stackoverflow.com/questions/1369035/how-do-i-prevent-a-parents-onclick-event-from-firing-when-a-child-anchor-is-cli
        });
}