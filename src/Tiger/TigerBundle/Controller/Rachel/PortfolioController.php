<?php

namespace Tiger\TigerBundle\Controller\Rachel;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;


// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


class PortfolioController extends Controller
{
    /**
     * @Route("/")
     * @Template()
     */
    public function indexAction()
    {

        return array();
    }

    /**
     * @Route("/")
     * @Template()
     */
    public function slideShowAction()
    {
        $root = $_SERVER['DOCUMENT_ROOT'];
        $dir    = '/public/portfolio/slideshow/slides/';
        $files = scandir($root.$dir, 1);
        //dont count the directory listings
        $count = count($files) - 2; 
        //remember index is set to 0 start
        $lastI = $count - 1;

        //now we build the album info
        foreach ($files as $key => $value) {
            if($value !== '.' && $value !=='..')
            {
                $info = getimagesize($root.$dir.$value);
                $prev = ($key == 0) ? $lastI : ($key -1);
                $next = ($key == $lastI) ? 0 : ($key +1);
                $album[] = array(
                    'url' => $dir.$value,
                    'current' => $key,
                    'prev' => $prev,
                    'next' => $next,
                    'imageHeight' => $info[1],
                    'imgageWidth' => $info[0]
                );
            }    
        }
       
        $data = array(
            'album' => $album,
            'count' => $count
        );

        return $data;
    }

}