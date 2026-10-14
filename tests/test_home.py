"""What the « Niak » panel's home page says about Niak Weather: blue when every place is followed, orange with what to do."""
from engine.home import MIN_CARD, Place, card_outdated, status


def test_no_place_is_an_action():
    result = status([], None)
    assert result["level"] == "action" and "Aucun lieu" in result["summary"]


def test_a_place_with_its_station_answering_is_blue():
    result = status([Place("Maison", station=9, links=["Niak Confort"])], "2.0.8")
    assert result["level"] == "ok"
    assert result["summary"] == "1 lieu suivi avec sa station, rien à régler."
    assert result["links"] == ["Relié à Niak Confort · Maison"]
    assert result["details"] == ["Carte Niak Weather 2.0.8, en accord avec l’intégration."]


def test_a_station_that_does_not_answer_is_orange():
    whole = status([Place("Maison", station=2, silent=["Température", "Rafales"])], None)
    assert whole["level"] == "action" and whole["details"] == ["La station ne répond pas"]
    part = status([Place("Maison", station=5, silent=["Rafales"])], None)
    assert part["details"] == ["Ne répond pas : Rafales"]


def test_each_thing_to_do_is_counted_and_said():
    result = status([Place("Maison", station=3, forecast=False, needs=["Vigilance : il faut la vigilance Météo-France"])], None)
    assert result["level"] == "action" and result["summary"] == "1 lieu suivi avec sa station, 2 points à régler."
    assert result["details"] == ["Prévisions pas encore reçues du service météo", "Vigilance : il faut la vigilance Météo-France"]


def test_several_places_name_the_one_concerned():
    result = status([Place("Maison", station=3), Place("Chalet", loaded=False)], None)
    assert result["summary"] == "2 lieux suivis, 1 point à régler."
    assert result["details"] == ["Calcul arrêté : Chalet"]


def test_card_version_unknown_says_nothing_older_is_an_action_missing_is_a_hint():
    assert status([Place("Maison")], None)["details"] == []
    assert status([Place("Maison")], "2.0.7")["level"] == "action"
    assert "non installée" in status([Place("Maison")], "")["details"][0]
    assert status([Place("Maison")], "")["level"] == "ok"


def test_a_beta_counts_as_its_release():
    assert not card_outdated("2.0.9-beta.1")
    assert not card_outdated(MIN_CARD)
    assert card_outdated("2.0.7") and card_outdated("")
