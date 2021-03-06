function change_progress_bar_value($bar, value, max) {
  var siz = (value / max * 100).toFixed(2);
  $bar.css("width", siz + "%")
    .attr("aria-valuenow", value)
    .text(Number((value).toFixed(2)) + "/" + max);
  if (siz >= 100) {
    $bar.addClass("progress-bar-green");
    $bar.removeClass("progress-bar-red");
  } else {
    $bar.addClass("progress-bar-red");
    $bar.removeClass("progress-bar-green");
  }
}

function update_progress_bar_values($progress_bar, buff){
  $progress_bar
    .attr("aria-valuemax", buff.requirement)
    .text($progress_bar.attr("aria-valuenow")+"/"+$progress_bar.attr("aria-valuemax"))
    .attr("data-multiplier", buff.multiplier)
    .data("multiplier", buff.multiplier);
  if (buff.linked_units != undefined){
    $progress_bar.attr("data-linked-units", buff.linked_units.toString())
      .data("linked-units", buff.linked_units.toString());
  }
  if (buff.linked_multiplier != undefined){
    $progress_bar.attr("data-linked-multiplier", buff.linked_multiplier.toString())
      .data("linked-multiplier", buff.linked_multiplier.toString());
  }
  update_progress_bar($progress_bar, $progress_bar.parents(".block").find(".unit-input[type='number']").first());
}

function get_unit_input_values($input) {
  var val = 0;
  var val_sr = 0;
  if ($input.attr("id").endsWith("-sr")) {
    val_sr += handle_nan(parseInt($input.val()));
    val += handle_nan(parseInt($("#" + $input.attr("id").replace("-sr", "")).val()));
  } else {
    val_sr += handle_nan(parseInt($("#" + $input.attr("id") + "-sr").val()));
    val += handle_nan(parseInt($input.val()));
  }
  return {
    nsr: val,
    sr: val_sr
  };
}

function update_progress_bar($bar, $input){

  var unit_values = get_unit_input_values($input);
  var multiplier = parseFloat($bar.attr("data-multiplier"));

  var linked_units = $bar.data("linked-units");
  var val_linked = 0;
  var val_sr_linked = 0;
  var additional_bars_to_update = [];

  if(linked_units != ""){
    linked_units = linked_units.replace("]", "").replace("[", "").replaceAll("'", "").split(',');
    linked_units.forEach(function(part, index, linked_units) {
        linked_units[index] = linked_units[index].trim().replaceAll(" ", "_");
    });
    var linked_multiplier = ($bar.attr("data-linked-multiplier") == undefined) ?
      Array(linked_units.length).fill().map(function(){return 1.0}) :
      $bar.attr("data-linked-multiplier").replace("]", "").replace("[", "").replace(" ", "").split(",").map(Number);
    var i = 0;
    for (let unit of linked_units){
      var $unit_cell = $("#"+unit.replace(" ", "_"));
      var other_unit_values = get_unit_input_values($unit_cell.find(".unit-input[type='number']").first());
          val_linked += linked_multiplier[i]*other_unit_values.nsr;
          val_sr_linked += linked_multiplier[i]*other_unit_values.sr;
        for (let add_buff of $unit_cell.find(
          ".progress-bar[data-linked-units*='"+$input.data("unit").replace("_"," ")+"']")){
          additional_bars_to_update.push(add_buff);
        }

        i += 1;
      }
  }
  var current_progress = multiplier*unit_values.nsr + unit_values.sr + (multiplier*val_linked + val_sr_linked);
  var max = $bar.attr("aria-valuemax");
  change_progress_bar_value($bar, current_progress, max);

  for (let add_bar of additional_bars_to_update){
    var $add_bar = $(add_bar);
     if($add_bar.attr("data-linked-multiplier").replace("]", "").replace("[", "").replace(" ", "").split(",").map(Number).every( v => v === 1.0 )){
      var _current_progress = current_progress;
      change_progress_bar_value($(add_bar), _current_progress, $(add_bar).attr("aria-valuemax"));
    } else {
      if ($add_bar.parents(".block").attr("id") == linked_units[0].replaceAll(" ", "_") &&
      $bar.parents(".block").find(".pet-image.five-star-pet").length > 0){
        var linked_multiplier = $add_bar.attr("data-linked-multiplier").replace("]", "").replace("[", "").replace(" ", "").split(",").map(Number);
        var other_unit_values = get_unit_input_values($add_bar.parents(".block").find(".unit-input[type='number']").first());
        var _current_progress = multiplier*other_unit_values.nsr + other_unit_values.sr + linked_multiplier[linked_multiplier.length-1]*(multiplier*unit_values.nsr + unit_values.sr);
        change_progress_bar_value($(add_bar), _current_progress, $(add_bar).attr("aria-valuemax"));
    }
    }
  }
}


function load_input_value($unit_input) {
  idb.open('endless-farming-db')
    .then(function(db) {
      var tx = db.transaction('units', 'readwrite');
      var store = tx.objectStore('units');
      return store.get($unit_input.data("unit"));
    }).then(function(val) {
      if (val != undefined) {
        if ($unit_input.attr("id").endsWith("-sr")) {
          $unit_input.val(val.sr);
        } else {
          $unit_input.val(val.nsr);
        }
        update_all_progress_bars_of_input($unit_input);
      }
    });
}

async function update_all_progress_bars_of_input($input) {
  var $unit_cell = $("#" + $input.data("unit"));
  for (let bar of $unit_cell.find('[role="progressbar"]')) {
    await update_progress_bar($(bar), $input);
  }
}

function getPet(petid) {
  return $.ajax({
    type: "GET",
    url: Flask.url_for("core.get_pet", {
      "petid": petid
    }),
    dataType: "json",
    async: true
  });
}

function getUnit(unitid) {
  return $.ajax({
    type: "GET",
    url: Flask.url_for("core.get_unit", {
      "unitid": unitid
    }),
    dataType: "json",
    async: true
  });
}

function getLinkedActivePets(buff, items) {
  var linked_active_pets = [];
  for (let item of items) {
    if (item.fragments >= 330 && buff.linked_pets.includes(item.name.replace("_", " "))) {
      linked_active_pets.push(item.name);
    }
  }
  return linked_active_pets;
}

function updateBuffRequirement(buff, id, items) {
  var linked_active_pets = getLinkedActivePets(buff, items);
  buff.requirement = buff.requirement[linked_active_pets.length];
  var $progbar = $("#" + id + "-image").parents(".block").find('[data-original-title="' + buff.name + '"]').find(".progress-bar");
  update_progress_bar_values($progbar, buff);
}

async function updateBuffs($petImage, items) {
  for (let item of items) {
    if (item.name == $petImage.data("pet")) {
      if (item.fragments >= 330) {
        $petImage.addClass("five-star-pet");
        await getPet($petImage.data("pet")).then(async function(data) {
          const $unit_cell = $("#" + $petImage.data("unit"));
          var $prog_bar_add_buff = $unit_cell.find(".additional_buff");
          $prog_bar_add_buff.removeClass("progress-bar-hidden");
          $prog_bar_add_buff.parent().popover();
          for (let buff of data.pet.buffs) {
            var $buff_span = $unit_cell.find('[data-original-title="' + buff.name + '"]');
            $buff_span.attr("data-content", buff["description"]);
            if (buff.linked_pets == undefined) {
              update_progress_bar_values($buff_span.find(".progress-bar"), buff);
            } else {
              var linked_active_pets = getLinkedActivePets(buff, items);
              await updateBuffRequirement(buff, data.petid, items);
              for (let linked_pet of buff.linked_pets) {
                var linked_pet_info = await getPet(linked_pet.replaceAll(" ", "_"));
                var linked_pet_buffs = linked_pet_info.pet.buffs;
                for (let linked_pet_buff of linked_pet_buffs) {
                  if (linked_pet_buff.name == buff.name) {
                    var nr = getLinkedActivePets(linked_pet_buff, items).length - 1;
                    linked_pet_buff.requirement = linked_pet_buff.requirement[nr];
                    update_progress_bar_values($("#" + linked_pet_info.petid.replace(" ", "_") + "-image").parents(".block").find('[data-original-title="' + linked_pet_buff.name + '"]').find(".progress-bar"), linked_pet_buff);
                  }
                }
              }
            }
          }
        });
      }
    }
  }
}

(function(yourcode) {

  yourcode(window.jQuery, window.indexedDB, window, document);

}(function($, indexedDB, window, document) {

  $(function() {

    $(".unit-input[type='number']").inputSpinner();

    $(".modal").on('shown.bs.modal', function(e) {
      var tab = e.relatedTarget.hash;
      $('.nav-tabs a[href="'+tab+'"]').tab('show');
    });

    $('.block').each(function() {
      $unit_cell = $(this);
      for (let bar of $unit_cell.find('[role="progressbar"]')) {
        for (let input of $unit_cell.find(".unit-input[type='number']")) {
          update_progress_bar($(bar), $(input));
        }
      }
    });

    idb.open("endless-farming-db").then(function(db) {
      var tx = db.transaction('pets', 'readwrite');
      var store = tx.objectStore('pets');
      return store.getAll();
    }).then(function(items) {
      $('.pet-image').each(async function() {
        console.log()
        await getUnit($(this).parents('.block')[0].id).then(function(unit){
          for (buff of unit.unit.buffs){
              if (buff.linked_pets != undefined){
                updateBuffRequirement(buff, $(this).data("unit"), items)
              }
          }
          updateBuffs($(this), items);
        }.bind(this))
      });
    });

    $(".unit-input[type='number']").bind('change', function() {
      $this = $(this);
      update_all_progress_bars_of_input($this);
      idb.open('endless-farming-db').then(function(db) {
        var tx = db.transaction('units', 'readwrite');
        var store = tx.objectStore('units');
        unit_values = get_unit_input_values($this);
        var item = {
          name: $this.data("unit"),
          nsr: unit_values.nsr,
          sr: unit_values.sr
        };
        store.put(item);
        return tx.complete;
      }.bind($this));
    });

    $(".unit-input[type='number']").each(function() {
      load_input_value($(this));
    });
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').each(function() {
      prog_bar = $(this).children().first();
      if (!$(prog_bar).attr('class').split(/\s+/).includes("progress-bar-hidden")) {
        $(this).popover();
      }
    });
  });
}));