"""Offline exact-headword definition regressions; no website requests."""
from pathlib import Path
import json,runpy,unittest,urllib.parse
ROOT=Path(__file__).resolve().parents[1]
parser=runpy.run_path(str(ROOT/'tools/cache-word-circle-definitions.py'))
def article(word,body='Невелика земноводна тварина.',canonical=None):
 return '<link rel="canonical" href="https://slovnyk.ua/index.php?swrd='+urllib.parse.quote(canonical or word)+'"><h4 class="text-uppercase">'+word+'</h4><div class="toggle-sum"><p><b>'+word+'</b>, и, <i>ж.</i> '+body+'</p></div>'
class ExactDefinitions(unittest.TestCase):
 def test_exact(self):
  value=parser['parse_page'](article('жаба'),'ЖАБА');self.assertEqual(value['headword'],'жаба');self.assertIn('земноводна',value['text'])
 def test_inflected_search_is_not_exact(self):self.assertIsNone(parser['parse_page'](article('жаба'),'жаб'))
 def test_canonical_redirect_is_not_exact(self):self.assertIsNone(parser['parse_page'](article('жаб',canonical='жаба'),'жаб'))
 def test_title_match_without_article_headword_is_not_exact(self):self.assertIsNone(parser['parse_page'](article('жаба').replace('<b>жаба</b>','<b>ЖАБЕНЯ</b>'),'жаба'))
 def test_stress_and_malformed_homonym_number(self):
  page=article('габа').replace('<b>габа</b>','<b>ГАБ<span class="nagolos">А</span><sup>1</b></sup>');self.assertEqual(parser['parse_page'](page,'габа')['headword'],'габа')
 def test_distinct_letters_stay_distinct(self):
  for a,b in [('їжа','іжа'),('край','краи'),('ґніт','гніт'),('ёлка','елка')]:self.assertNotEqual(parser['normalize'](a),parser['normalize'](b))
  self.assertEqual(parser['normalize']('жа́ба'),'жаба')
 def test_snapshot_provenance(self):
  values=json.loads((ROOT/'word-circle/sources/definitions-uk-slovnyk.json').read_text(encoding='utf-8'));self.assertGreater(len(values),3000)
  for word,entry in values.items():
   self.assertEqual(parser['normalize'](word),parser['normalize'](entry['headword']));self.assertEqual(word,entry['word'].lower());self.assertLessEqual(len(entry['text'].split()),20)
   url=urllib.parse.urlparse(entry['url']);self.assertEqual(url.netloc,'slovnyk.ua');self.assertEqual(urllib.parse.parse_qs(url.query)['swrd'],[word])
  self.assertIn('жаба',values);self.assertIn('габа',values);self.assertNotIn('жаб',values)
if __name__=='__main__':unittest.main()
